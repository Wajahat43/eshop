import redis from '@packages/libs/redis';
import { kafka } from '@packages/utils/kafka';
import { WebSocketServer, WebSocket } from 'ws';
import { Server as HttpServer } from 'http';
import { IncomingMessage } from './utils/types';
import {
  generateRedisKey,
  generateUserKey,
  handleSeenMessage,
  validateMessage,
  createMessageEvent,
  updateUnseenCount,
  sendMessageToUser,
  sendUnseenCountUpdate,
} from './utils/helpers';

const producer = kafka.producer();

const connectedUsers = new Map<string, WebSocket>();
const unseenCount = new Map<string, number>();

/**
 * Handle user registration. Set the user in the connectedUsers map and set the redis key to 1 for 24 hours.
 * @param userId - The ID of the user
 * @param ws - The WebSocket instance
 */
async function handleUserRegistration(userId: string, ws: WebSocket): Promise<void> {
  connectedUsers.set(userId, ws);
  console.log(`User ${userId} connected to websocket`);

  const redisKey = generateRedisKey(userId);
  await redis.set(redisKey, '1');
  await redis.expire(redisKey, 60 * 60 * 24); // 24 hours
}

/**
 * Handle regular message processing
 * @param message - The message from the client
 */
async function handleRegularMessage(message: IncomingMessage): Promise<void> {
  const { payload, event } = createMessageEvent(message);
  const receiverKey = generateUserKey(message.receiverId, message.senderType === 'seller' ? 'user' : 'seller');
  const senderKey = generateUserKey(message.senderId, message.senderType);

  const newUnseenCount = updateUnseenCount(receiverKey, message.conversationId, unseenCount);
  const receiverOnline = sendMessageToUser(receiverKey, event, connectedUsers);
  if (receiverOnline) {
    sendUnseenCountUpdate(receiverKey, newUnseenCount, connectedUsers, message.conversationId);
    console.log(`Message sent to ${receiverKey}`);
  } else {
    console.log(`User ${receiverKey} is offline and message is queued`);
  }

  sendMessageToUser(senderKey, event, connectedUsers);

  await producer.send({
    topic: 'chat.new_message',
    messages: [
      {
        key: message.conversationId,
        value: JSON.stringify(payload),
      },
    ],
  });
  console.log(`Message pushed to kafka consumer`);
}

/**
 * Handle user disconnection from websocket.
 * @param userId - The ID of the user
 */
async function handleUserDisconnection(userId: string): Promise<void> {
  console.log(`User ${userId} disconnected from websocket`);
  connectedUsers.delete(userId);
  console.log(`Disconnected user ${userId}`);

  const redisKey = generateRedisKey(userId);
  await redis.del(redisKey);
  console.log(`Redis key ${redisKey} deleted`);
}

/**
 * Handle incoming messages
 * @param rawMessage - The raw message from the client: We have 3 actions: 1. User registration, 2. Seen message update, 3. Regular message
 * @param ws - The WebSocket instance
 * @param registeredUserId - The ID of the registered user
 * @returns The ID of the registered user
 */
async function handleIncomingMessage(
  rawMessage: any,
  ws: WebSocket,
  registeredUserId: string | null,
): Promise<string | null> {
  try {
    const messageStr = rawMessage.toString();

    // Handle user registration (first plain message)
    if (!registeredUserId && !messageStr.startsWith('{')) {
      const userId = messageStr;
      await handleUserRegistration(userId, ws);
      return userId;
    }

    const message: IncomingMessage = JSON.parse(messageStr);

    // Handle seen message updates
    if (message.type === 'MARK_AS_SEEN' && registeredUserId) {
      handleSeenMessage(registeredUserId, message.conversationId, unseenCount);
      return registeredUserId;
    }

    // Handle regular messages
    if (validateMessage(message)) {
      await handleRegularMessage(message);
    } else {
      console.log('Invalid message');
    }

    return registeredUserId;
  } catch (error) {
    console.error('Error processing message', error);
    return registeredUserId;
  }
}

/**
 * Create the websocket server.
 * @param server - The HTTP server
 */
export async function createWebSocketServer(server: HttpServer) {
  const wss = new WebSocketServer({ server });

  await producer.connect();
  console.log('Connected to Kafka producer in chat web socket');

  wss.on('connection', async (ws: WebSocket) => {
    console.log('New client connected');

    let registeredUserId: string | null = null;

    ws.on('message', async (rawMessage) => {
      registeredUserId = await handleIncomingMessage(rawMessage, ws, registeredUserId);
    });

    ws.on('close', async () => {
      if (registeredUserId) {
        await handleUserDisconnection(registeredUserId);
      }
    });

    ws.on('error', (error) => {
      console.error('Error in websocket', error);
    });
  });

  console.log('WebSocket server started');
}
