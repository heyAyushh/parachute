import Redis from 'ioredis';
import 'dotenv/config';

let connection = new Redis(process.env.REDIS_URL, {
 maxRetriesPerRequest: null,
 enableReadyCheck: false,
});

export default {
 concurrency: parseInt(process.env.QUEUE_CONCURRENCY || '1', 10),
 queueName: process.env.QUEUE_NAME || 'airdrops',
 connection,
 limiter: {
  max: parseInt(process.env.MAX_LIMIT || '2', 10),
  duration: parseInt(process.env.DURATION_LIMIT || '1000', 10),
 },
};
