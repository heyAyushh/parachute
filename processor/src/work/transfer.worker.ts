import { Worker } from 'bullmq';
import config from '../config';

export const worker = new Worker(config.queueName, `${__dirname}/transfer.processor`, {
 connection: config.connection,
 concurrency: config.concurrency,
 limiter: config.limiter,
});
