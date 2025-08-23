import Redis from 'ioredis';

let redis: Redis;

try {
  if (process.env.REDIS_DATABASE_URI) {
    redis = new Redis(process.env.REDIS_DATABASE_URI, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    redis.on('error', (error) => {
      console.warn('Redis connection error:', error.message);
    });

    redis.on('connect', () => {
      console.log('Connected to Redis');
    });
  } else {
    console.warn('REDIS_DATABASE_URI environment variable is not set');
  }
} catch (error) {
  console.warn('Failed to initialize Redis:', error);
}

export default redis;
