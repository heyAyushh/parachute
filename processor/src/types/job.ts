import { PublicKey } from '@solana/web3.js';

export interface Transfer {
  from: PublicKey;
  to: PublicKey;
  lamports: number;
}
