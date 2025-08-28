import prisma from '@packages/libs/prisma';
import { kafka } from '@packages/utils/kafka';
import { Consumer, EachMessagePayload } from 'kafkajs';
import { generateUserKey } from './utils/helpers';
import { incrementUnseenCount } from '@packages/libs/redis/message.redis';

interface BufferedMessage {
  conversationId: string;
  content: string;
  senderId: string;
  senderType: string;
  createdAt: string;
}

const TOPIC = 'chat.new_message';
const GROUP_ID = 'chat-message-db-writer';
const BATCH_INTERVAL_MS = 5000;

const buffer: BufferedMessage[] = [];
let flushTimer: NodeJS.Timeout | null = null;

//Initialize kafka consumer
export async function startConsumer() {
  const consumer = kafka.consumer({ groupId: GROUP_ID });
  await consumer.connect();
  await consumer.subscribe({ topic: TOPIC, fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message: rawMessage }) => {
      if (!rawMessage?.value) {
        console.log('Received empty message, skipping');
        return;
      }

      try {
        const message: BufferedMessage = JSON.parse(rawMessage.value.toString()) as BufferedMessage;
        buffer.push(message);

        //If this is the first message in an empty array, start the flush timer.
        if (buffer.length === 1 && !flushTimer) {
          flushTimer = setTimeout(flushBufferToDb, BATCH_INTERVAL_MS);
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    },
  });
}

//Flush the buffer to the database and reset the timer.
async function flushBufferToDb() {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }

  if (buffer.length === 0) return;

  try {
    const result = await prisma.message.createMany({
      data: buffer.map((message) => ({
        conversationId: message.conversationId,
        content: message.content,
        senderId: message.senderId,
        senderType: message.senderType,
        createdAt: message.createdAt,
      })),
    });

    //Redis unseen counter only if db insert is successful.
    for (const message of buffer) {
      try {
        const receiverType = message.senderType === 'seller' ? 'user' : 'seller';
        await incrementUnseenCount(receiverType, message.conversationId);
      } catch (redisError) {
        console.error('Error updating Redis unseen count:', redisError);
      }
    }

    //Clear buffer after successful database insertion
    buffer.length = 0;
    console.log('Buffer cleared successfully');
  } catch (error) {
    console.error('Error in flushing messages to db:', error);

    // Reset timer to try again later
    flushTimer = setTimeout(flushBufferToDb, BATCH_INTERVAL_MS);
  }
}
