import { PublicKey } from '@solana/web3.js';
import { Queue } from 'bullmq';
import config from '../config';
import { Transfer } from '../types/job';
// import logger from './logger';

const queue = new Queue<Transfer>(config.queueName, {
 connection: config.connection,
});

// const args = process.argv.slice(2);

(async () => {
 await queue.add('send-simple', {
  from: 'A6fRLWLJHF1iHxjGWRdZM3XDVLf7ZA6eejpfZEEaQSRt' as unknown as PublicKey,
  lamports: 100000,
  to: 'FJ89JucrDJARvWp5xRGNeXm6G2mu3wZrEqog3PYYS7RH' as unknown as PublicKey,
 });

//  logger.info(`Enqueued an email sending to ${args[0]}`);
})();
