import { PublicKey } from '@solana/web3.js';
import { Queue } from 'bullmq';
import config from '../config';
// import logger from './logger';

const queue = new Queue<Transfer>(config.queueName, {
  connection: config.connection,
});

export interface Transfer {
  from: PublicKey;
  to: PublicKey;
  lamports: number;
}

// const args = process.argv.slice(2);

export const addTransfer = async (transfer: Transfer, i: number) => {
  await queue.add('send-simple', {
    from: transfer.from,
    lamports: transfer.lamports,
    to: transfer.to,
  });
}