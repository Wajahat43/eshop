import express, { Request, Response } from 'express';
import * as path from 'path';
import cors from 'cors';
import proxy from 'express-http-proxy';
import httpProxy from 'http-proxy';
import { IncomingMessage } from 'http';
import { Socket } from 'net';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import initializeSiteConfig from './libs/initializeSiteConfig';
import http from 'http';

const app = express();

const createProxyErrorHandler =
  (serviceName: string) => (err: unknown, res: Response, next: (err?: unknown) => void) => {
    console.error(`Proxy error for ${serviceName}:`, err);

    const unwrapError = (error: unknown): NodeJS.ErrnoException | undefined => {
      if (error instanceof AggregateError && Array.isArray(error.errors) && error.errors.length > 0) {
        return unwrapError(error.errors[0]);
      }

      return error as NodeJS.ErrnoException | undefined;
    };

    const underlyingError = unwrapError(err);
    const errorCode = underlyingError?.code;
    const shouldReturnServiceUnavailable =
      errorCode === 'ECONNREFUSED' || errorCode === 'EHOSTUNREACH' || errorCode === 'ETIMEDOUT';

    if (res.headersSent) {
      return next(err);
    }

    if (shouldReturnServiceUnavailable) {
      res.status(503).json({ error: `${serviceName} service is unavailable` });
    } else {
      res.status(500).json({ error: `Unexpected error while contacting ${serviceName}` });
    }
  };

const createServiceProxy = (target: string, serviceName: string) =>
  proxy(target, {
    proxyErrorHandler: createProxyErrorHandler(serviceName),
  });

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOriginsEnv = process.env.CORS_ORIGINS || '';
      const allowedOrigins = allowedOriginsEnv
        ? allowedOriginsEnv.split(',').map((o) => o.trim())
        : ['http://localhost:3000', 'http://localhost:3001'];

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    allowedHeaders: ['Authorization', 'Content-Type', 'X-Auth-Actor', 'X-Auth-Role', 'X-Client-Role'],
    credentials: true,
  }),
);

app.use(morgan('dev'));
app.use(cookieParser());
app.set('trust proxy', 1);

//Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: () => 1000, // Limit each IP to
  message: { error: 'Too many requests. Please try again later' },
  standardHeaders: true,
  legacyHeaders: true,
  keyGenerator: (req: Request) => req.ip || 'unknown',
});

app.use(limiter);

// CRITICAL: Handle Stripe webhook BEFORE any JSON parsing middleware
app.post('/order/api/create-order', express.raw({ type: 'application/json' }), (req: Request, res: Response) => {
  const stripeSignature = req.get('stripe-signature');

  if (!stripeSignature) {
    console.error('Missing Stripe signature header');
    return res.status(400).send('Missing Stripe signature');
  }

  console.log('Forwarding Stripe webhook to order service...');
  console.log('Signature present:', !!stripeSignature);
  console.log('Body length:', req.body?.length);

  // Forward to order service manually to preserve raw body
  const options = {
    hostname: '127.0.0.1',
    port: 6004,
    path: '/api/create-order',
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'content-length': Buffer.byteLength(req.body),
      'stripe-signature': stripeSignature,
      // Forward other Stripe headers if present
      'stripe-event-id': req.get('stripe-event-id') || '',
      'stripe-event-type': req.get('stripe-event-type') || '',
      // Forward client info
      'user-agent': req.get('user-agent') || 'api-gateway',
      'x-forwarded-for': req.ip,
      'x-real-ip': req.ip,
    },
  };

  const proxyReq = http.request(options, (proxyRes) => {
    console.log('Order service response status:', proxyRes.statusCode);

    // Set response status
    res.status(proxyRes.statusCode || 500);

    // Forward response headers (excluding hop-by-hop headers)
    const hopByHopHeaders = [
      'connection',
      'keep-alive',
      'proxy-authenticate',
      'proxy-authorization',
      'te',
      'trailers',
      'transfer-encoding',
      'upgrade',
    ];

    // Set all headers BEFORE piping the response
    Object.keys(proxyRes.headers).forEach((key) => {
      if (!hopByHopHeaders.includes(key.toLowerCase())) {
        const value = proxyRes.headers[key];
        if (value) {
          res.set(key, Array.isArray(value) ? value.join(', ') : value);
        }
      }
    });

    // Check if headers have already been sent before piping
    if (res.headersSent) {
      console.error('Headers already sent, cannot pipe response');
      return;
    }

    // Forward response body AFTER all headers are set
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('Error forwarding to order service:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to forward webhook to order service' });
    }
  });

  proxyReq.on('timeout', () => {
    console.error('Timeout forwarding to order service');
    if (!res.headersSent) {
      res.status(504).json({ error: 'Timeout forwarding webhook' });
    }
  });

  // Write the raw body exactly as received from Stripe
  proxyReq.write(req.body);
  proxyReq.end();
});

// Apply JSON parsing middleware AFTER webhook routes
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ limit: '200mb', extended: true }));

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/gateway-health', (req, res) => {
  res.send({ message: 'Welcome to api-gateway!' });
});

// Specific routes must come before the catch-all route
app.use('/product', createServiceProxy('http://127.0.0.1:6002', 'product'));
//app.use('/seller', createServiceProxy('http://127.0.0.1:6003', 'seller'));

// Handle other order routes (excluding webhook which is handled above)
app.use('/order', (req: Request, res: Response, next) => {
  // Skip webhook endpoint since it's already handled
  if (req.path === '/api/create-order' && req.method === 'POST') {
    return next(); // This should not be reached due to the specific route above
  }
  createServiceProxy('http://127.0.0.1:6004', 'order')(req, res, next);
});

// Chat HTTP under /chat -> forwards to chat-service /api
app.use('/chat', createServiceProxy('http://127.0.0.1:6005', 'chat'));

app.use('/', createServiceProxy('http://127.0.0.1:6001', 'user-ui'));

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);

  try {
    initializeSiteConfig();
    console.log('Site config initialized');
  } catch (error) {
    console.error('Error initializing site config:', error);
  }
});

// WS endpoint at /chat-ws -> forwards to chat-service WS root
const wsProxy = httpProxy.createProxyServer({
  target: 'ws://127.0.0.1:6005',
  changeOrigin: true,
  ws: true,
});

wsProxy.on('error', (err, req, socket) => {
  console.error('WebSocket proxy error for chat service:', err);

  if (socket instanceof Socket && !socket.destroyed) {
    socket.end();
  }
});

server.on('upgrade', (req: IncomingMessage, socket: Socket, head: Buffer) => {
  if (req.url && req.url.startsWith('/chat-ws')) {
    req.url = req.url.replace(/^\/chat-ws/, '');
    wsProxy.ws(req, socket, head);
  }
});
server.on('error', console.error);
