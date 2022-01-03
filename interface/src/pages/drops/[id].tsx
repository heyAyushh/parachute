// id is batch id

// 3. api pull redis keys using regex batchid:*
// 3. api return pending tasks, completed tasks, failed tasks
// polling useSwr on 3. api
// animate flips 
// give download csv after batch completed

import { InferGetServerSidePropsType } from "next";
import { SOLANA_NETWORK } from "../../config/solana";
import prisma from "../../lib/prisma";
import { addTransfer } from "../../lib/processor";
import { withSessionSsr } from "../../lib/withSession";
import { PublicKey } from '@solana/web3.js';
import { Box, Button, Heading, Text } from "@chakra-ui/react";
import { ArrowForwardIcon } from '@chakra-ui/icons';
import Link from 'next/link';

export const getServerSideProps = withSessionSsr(
  async function ({
    req,
    res,
    query,
  }) {
    const user = req.session.user;

    if (user === undefined) {
      res.setHeader("location", "/login");
      res.statusCode = 302;
      res.end();
      return {
        props: {
          user: { isLoggedIn: false, login: "", avatarUrl: "" },
        },
      };
    }

    const { id } = query as { id: string };

    const batch = await prisma.batch.findFirst({
      where: {
        id,
      }, include: {
        user: true,
        wallet: true,
      }
    });

    if (!batch) {
      return {
        redirect: {
          permanent: false,
          destination: "/404"
        }
      };
    } else if (batch.user.id !== user.id) {
      return {
        redirect: {
          permanent: false,
          destination: "/404"
        }
      };
    } else {
      if (batch.status === "PENDING") {
        await prisma.batch.update({
          where: {
            id,
          },
          data: {
            status: "STARTED",
          },
        });

        const drops = await prisma.drop.findMany({
          where: {
            batchId: id,
          },
        })

        await Promise.all(drops.map((drp, i) => {
          if (!batch?.wallet?.publicKey) {
            return null;
          }

          return addTransfer({
            from: batch?.wallet?.publicKey as unknown as PublicKey,
            to: drp.to as unknown as PublicKey,
            lamports: Number(drp.amount),
          }, i);
        }))

        return {
          props: {
            user,
            batch: {
              id: batch.id,
              status: "STARTED",
            },
            address: batch?.wallet?.publicKey,
          },
        };
      }
    }

    return {
      props: {
        user,
        batch: {
          id: batch.id,
          status: "STARTED",
        },
        address: batch?.wallet?.publicKey,
      },
    };
  });


export default function SsrProfile({
  user,
  batch,
  address,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  
  return (
    <div className="flex items-center justify-center">
      <h1></h1>
      <Box maxW="32rem" className="border-2 border-green-400 rounded-box p-10">
        <Heading mb={4}>Drops</Heading>
        <Text fontSize="xl">
          Your airdrops are being processed as we deliever them parachutes.
        </Text>
        <Link href={`https://explorer.solana.com/address/${address}?cluster=${SOLANA_NETWORK}`}
          passHref
        >
          <Button size="lg" colorScheme="green" mt="24px"
            rightIcon={<ArrowForwardIcon />}
          >
            Watch the drops in Real Time
          </Button>
        </Link>
      </Box>
    </div>
  );
}