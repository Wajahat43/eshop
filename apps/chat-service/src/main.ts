import express from 'express';
import cookieParser from 'cookie-parser';
import { startConsumer } from './chat-message.consumer';
import { createWebSocketServer } from './websocket';
import chatRoutes from './routes/chat.routes';

const app = express();
app.use(express.json());
app.use(cookieParser());

app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to chat-service!' });
});

// Chat routes
app.use('/api', chatRoutes);

//In the video the port is 6006. Can be helpful in debugging.
const port = process.env.PORT || 6005;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});

//Start Websocket server
createWebSocketServer(server);

//Start our kafka consumer
startConsumer().catch((error: any) => {
  console.log('Error in kafka consumer chat service', error);
});

server.on('error', console.error);
