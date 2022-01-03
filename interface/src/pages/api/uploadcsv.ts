import middleware from '../../lib/uploadMiddleware';
import nextConnect from 'next-connect';
import csv from 'csvtojson';
import { withSessionRoute } from "../../lib/withSession";
import Big from 'big.js';
import prisma from "../../lib/prisma";
import * as web3 from '@solana/web3.js';
import { encryptKey } from "../../lib/cryptdb";
// 1. api upload csv
// 1. api parse csv 
// 1. api create a batch in psdb (default status pending)
// 1. api create a wallet 
// 1. api bulk import txns

const handler = nextConnect()
handler.use(middleware)

handler.post(async (req, res) => {
  try {
    if (!req.session.user?.id) {
      res.statusCode = 404;
      res.end(JSON.stringify({
        status: 'failure',
        message: 'Please log in'
      }))
    }

    // @ts-expect-error Incoming message types
    const files = req.files;

    const jsonArray = await csv().fromFile(files['File[]'][0].path);

    const batch = await prisma.batch.create({
      data: {
        count: jsonArray.length,
        userId: req.session.user?.id as string,
      }
    })

    const storeWallet = web3.Keypair.generate();    
    const enc = Buffer.from(storeWallet.secretKey).toString('base64');

    const wallet = await prisma.wallet.create({
      data: {
        publicKey: storeWallet.publicKey.toString(),
        privateKey: encryptKey(enc),
        batchId: batch.id,
      }
    })

    const drops = await prisma.drop.createMany({
      data: jsonArray.map((item, i) => {
        return {
          amount: item.lamports,
          to: item.to,
          batchId: batch.id,
          count: i,
        }
      })
    })

    const reducer = (previousValue: any, currentValue: any) => (previousValue).plus(Big(currentValue.lamports));

    // Get total lamports in sol
    const total_amount = jsonArray.reduce(reducer, Big('0')).div(Big(web3.LAMPORTS_PER_SOL)).toString();

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      type: 'success',
      records: jsonArray.length,
      total_amount,
      batchId: batch.id,
      walletPublicKey: storeWallet.publicKey.toString()
    }));
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      type: 'failure',
      message: err? (err as Error)?.message : 'Unknown error'
    }));
  }
})

export const config = {
  api: {
    bodyParser: false
  }
}

export default withSessionRoute(handler);