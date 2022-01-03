import { Job } from 'bullmq';
import * as web3 from '@solana/web3.js';
import { PrismaClient } from '@prisma/client';
import { Transfer } from '../types/job';
import logger from '../utils/logger';
import { decryptKey } from '../utils/cryptdb';
// import config from '../config';

const SOLANA_NODE_URL = process?.env?.SOLANA_NODE_URL;
const CLUSTER = process?.env?.CLUSTER;
const prisma = new PrismaClient();

// eslint-disable-next-line consistent-return
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default async (job: Job<Transfer>) => {
 // Connect to cluster
 const connection = new web3.Connection(
  SOLANA_NODE_URL || (CLUSTER !== 'mainnet-beta' ? web3.clusterApiUrl('devnet') : web3.clusterApiUrl('mainnet-beta')),
  'confirmed',
 );

 try {
  const wallet = await prisma.wallet.findFirst({
   where: {
    publicKey: job?.data?.from as unknown as string,
   },
  });

  if (!wallet) {
   throw new Error('Wallet not found');
  }

  const decryptedKey = await decryptKey(wallet.privateKey);
  const privateKey = new Uint8Array(Buffer.from(decryptedKey, 'base64'));
  const from = web3.Keypair.fromSecretKey(privateKey);

  // Generate a new random public key
  let to = new web3.PublicKey(job.data.to);

  // Add transfer instruction to transaction
  let transaction = new web3.Transaction().add(
   web3.SystemProgram.transfer({
    fromPubkey: from.publicKey,
    toPubkey: to,
    lamports: web3.LAMPORTS_PER_SOL / 1000,
   }),
  );

  // Sign transaction, broadcast, and confirm
  return web3.sendAndConfirmTransaction(
   connection,
   transaction,
   [from],
  );
 } catch (err) {
  logger.error(err);
  throw err;
 }
};
