import { Kafka } from 'kafkajs';
import 'dotenv/config';

export const kafka = new Kafka({
  brokers: ['d29k284ji09vdf03220g.any.us-east-1.mpx.prd.cloud.redpanda.com:9092'],
  ssl: {},
  sasl: {
    mechanism: 'scram-sha-256',
    username: process.env.KAFKA_API_KEY!,
    password: process.env.KAFKA_API_SECRET!,
  } as any,
});
// export const kafka = new Kafka({
//   clientId: 'kafka-service',
//   brokers: ['d29k284ji09vdf03220g.any.us-east-1.mpx.prd.cloud.redpanda.com:9092'],
//   ssl: true,
//   sasl: {
//     mechanism: 'plain',
//     username: process.env.KAFKA_API_KEY!,
//     password: process.env.KAFKA_API_SECRET!,
//   } as any,
// });
