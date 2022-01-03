// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { randomUUID } from "crypto"
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from "../../lib/prisma"

type Data = { 
  challenge: string 
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
    const newChallenge = `Hey,\n please sign this message ${await randomUUID().split('-')[0]} &\n verify your connection to Parachute!`;
    const oldChallenge = await prisma.challenge.findFirst({ 
      where: { address: req.query.address as string }, 
      orderBy: { createdAt: 'desc' } 
    });

    !oldChallenge ? await prisma.challenge.create({
      data: {
        address: req.query.address as string,
        challenge: newChallenge
      },
    }) : await prisma.challenge.update({ 
      where: { id: oldChallenge.id },
      data: { challenge: newChallenge },
    });

    res.status(200).json({ challenge: newChallenge })
}
