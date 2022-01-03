// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { PublicKey } from '@solana/web3.js'
import prisma from '../../lib/prisma'
import nacl from 'tweetnacl'
import { withSessionRoute } from "../../lib/withSession"

type Data = {
  type?: 'success' | 'failure',
  error?: string | Error,
}

export default withSessionRoute(
  async function withIronSessionApiRoutehandler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
  ) {
  const challengeQuery = await prisma.challenge.findFirst({ 
    where: { address: req.body.address }, 
    orderBy: { createdAt: 'desc' }
  })
  if (!challengeQuery) {
    res.status(400).send({ error: 'Non-existent challenge', type: 'failure' })
    return
  }
  const pubKeyBytes = new PublicKey(req.body.address).toBytes()
  if (!nacl.sign.detached.verify(
    new TextEncoder().encode(challengeQuery.challenge),
    new Uint8Array(req.body.signature),
    pubKeyBytes
  )) {
    res.status(403).send({ error: 'Invalid signature for PubKey', type: 'failure' })
    return
  }
  const userQuery = await prisma.user.findFirst({ where: { publicKey: req.body.address }})
  if (!userQuery) {
    // if no user with address, create a new account
    const user = await prisma.user.create({
      data: { publicKey: req.body.address }
    })

    req.session.user = {
      id: user.id,
      address: user.publicKey,
    };
    await req.session.save();

    res.send({ type: "success" });
  } else {
    // user exists, login with wallet
    req.session.user = {
      id: userQuery.id,
      address: userQuery.publicKey,
    };
    await req.session.save();

    res.send({ type: "success" });
  }
})
