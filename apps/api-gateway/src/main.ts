import express, { Request } from 'express';
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

const app = express();

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
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: true,
  }),
);
app.use(morgan('dev'));
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ limit: '200mb', extended: true }));
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

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/gateway-health', (req, res) => {
  res.send({ message: 'Welcome to api-gateway!' });
});

// Specific routes must come before the catch-all route
app.use('/product', proxy('http://localhost:6002'));
//app.use('/seller', proxy('http://localhost:6003'));
app.use('/order', proxy('http://localhost:6004'));

// Chat HTTP under /chat -> forwards to chat-service /api
app.use('/chat', proxy('http://localhost:6005'));

app.use('/', proxy('http://localhost:6001'));

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
  target: 'ws://localhost:6005',
  changeOrigin: true,
  ws: true,
});

server.on('upgrade', (req: IncomingMessage, socket: Socket, head: Buffer) => {
  if (req.url && req.url.startsWith('/chat-ws')) {
    req.url = req.url.replace(/^\/chat-ws/, '');
    wsProxy.ws(req, socket, head);
  }
});
server.on('error', console.error);
