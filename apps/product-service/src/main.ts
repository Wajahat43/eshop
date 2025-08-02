import express from 'express';
import cors from 'cors';
import './jobs/product-cronjob';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
const swaggerDocument = require('./swagger-output.json');

import { errorMiddleware } from '@packages/error-handler/error-middleware';
import router from './routes/product.routes';

const app = express();

app.use(
  cors({
    origin: ['http://localhost:3000'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: true,
  }),
);

app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ limit: '200mb', extended: true }));
app.use(cookieParser());
app.get('/', (req, res) => {
  res.send({ message: 'Hello API from product service.' });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get('/docs-json', (req, res) => {
  res.json(swaggerDocument);
});

//Routes
app.use('/api', router);

app.use(errorMiddleware);

const port = process.env.port ?? 6002;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
  console.log(`Swagger docs available at http://localhost:${port}/docs`);
});
server.on('error', console.error);
