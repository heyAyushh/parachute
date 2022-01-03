
import * as web3 from '@solana/web3.js';
import Big from "big.js";
import { SOLANA_NETWORK } from "../config/solana";

export default async function transferSOL(
  amount: Big | number,
  publicKey: web3.PublicKey,
  signTransaction: any,
  connection: any,
  reciever: any,
  toast: any,
  // reciever?: web3.PublicKey | string,
) {

  try {
    if (!publicKey) {
      return
    }

    const recieverWallet = new web3.PublicKey(reciever);

    if (SOLANA_NETWORK === 'devnet') {
      // Airdrop some SOL to the sender's wallet, so that it can handle the txn fee
      const airdropSignature = await connection.requestAirdrop(
        publicKey,
        Big(amount).add(Big(0.0001)).mul(Big(web3.LAMPORTS_PER_SOL)).toNumber(),
      );
      // Confirming that the airdrop went through
      await connection.confirmTransaction(airdropSignature);
    }

    const transaction = new web3.Transaction().add(
      web3.SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: recieverWallet,
        lamports: Number(Big(amount).mul(Big(web3.LAMPORTS_PER_SOL)).toString()),
      }),
    );

    transaction.feePayer = publicKey;
    let blockhashObj = await connection.getRecentBlockhash();
    transaction.recentBlockhash = await blockhashObj.blockhash;

    if (!transaction) {
      console.log("Txn was not created");
      return;
    }

    let signed = await signTransaction(transaction);
    let signature = await connection.sendRawTransaction(signed.serialize());
    return connection.confirmTransaction(signature);
  } catch (err) {
    throw err;
  }
}