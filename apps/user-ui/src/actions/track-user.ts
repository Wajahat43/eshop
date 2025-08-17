'use server';
import { kafka } from 'packages/utils/kafka';

const producer = kafka.producer();

export async function sendKafkaEvent(eventData: {
  userId?: string;
  productId?: string;
  shopId?: string;
  device?: string;
  country?: string;
  city?: string;
  action: string;
}) {
  try {
    await producer.connect();

    const result = await producer.send({
      topic: 'users-events',
      messages: [{ value: JSON.stringify(eventData) }],
    });

    return { success: true, result };
  } catch (error) {
    console.error('❌ Failed to send event to Kafka:', error);
    throw error;
  } finally {
    await producer.disconnect();
  }
}
