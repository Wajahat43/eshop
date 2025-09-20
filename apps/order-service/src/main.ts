import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import { Request, Response, NextFunction } from 'express';
import { errorMiddleware } from '@packages/error-handler/error-middleware';
import orderRouter from './routes/order.route';
import { createOrder } from './controller/order.controller';

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOriginsEnv = process.env.CORS_ORIGINS || '';
      const allowedOrigins = allowedOriginsEnv
        ? allowedOriginsEnv.split(',').map((o) => o.trim())
        : ['http://localhost:3000'];

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

// Raw body parser for Stripe webhooks
app.post(
  '/api/create-order',
  bodyParser.raw({ type: 'application/json' }),
  (req: Request, res: Response, next: NextFunction) => {
    (req as any).rawBody = req.body;
    next();
  },

  (req: Request, res: Response, next: NextFunction) => createOrder(req as any, res, next),
);

app.use(express.json({ limit: '200mb' }));
app.use(cookieParser());
app.use(errorMiddleware);

app.use('/api', orderRouter);

app.get('/', (req, res) => {
  res.send({ message: 'Welcome to Order-service!' });
});

const port = process.env.PORT || 6004;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
