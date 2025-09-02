import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import { errorMiddleware } from '@packages/error-handler/error-middleware';
import orderRouter from './routes/order.route';
import { createOrder } from './controller/order.controller';

const app = express();

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:3001'];

app.use(
  cors({
    origin: allowedOrigins,
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: true,
  }),
);

// Raw body parser for Stripe webhooks
app.post(
  '/api/create-order',
  bodyParser.raw({ type: 'application/json' }),
  (req, res, next) => {
    (req as any).rawBody = req.body;
    next();
  },
  createOrder,
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
