import 'dotenv/config';
import { kafka } from '@packages/utils/kafka';
import { updateProductAnalytics, updateUserAnalytics } from './services/analytics.service';

const consumer = kafka.consumer({ groupId: 'user-events-group' });
const eventQueue: any[] = [];

const processQueue = async () => {
  if (eventQueue.length === 0) {
    return;
  }

  const events = [...eventQueue];
  eventQueue.length = 0;

  for (const event of events) {
    if (event.action === 'shop_visit') {
      // update shop analytics
    }

    const validActions = ['add_to_wishlist', 'add_to_cart', 'product_view', 'remove_from_wishlist', 'remove_from_cart'];
    if (!event.action || !validActions.includes(event.action)) {
      continue;
    }

    try {
      await updateUserAnalytics(event);
      await updateProductAnalytics(event);
    } catch (error) {
      console.error('Error processing event:', error);
    }
  }
};

// Process queue every 10 seconds
setInterval(processQueue, 10000);

// Kafka consumer for user events
export const consumeKafkaMessages = async () => {
  try {
    await consumer.connect();
    await consumer.subscribe({ topic: 'users-events', fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const event = JSON.parse(message.value?.toString() || '{}');
          eventQueue.push(event);
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      },
    });
  } catch (error) {
    console.error('Failed to start Kafka consumer:', error);
    throw error;
  }
};

// Start the consumer
consumeKafkaMessages().catch(console.error);
