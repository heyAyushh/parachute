import React, { useMemo } from "react";
import type { AppProps } from "next/app";
import dynamic from "next/dynamic";
import { ConnectionProvider } from "@solana/wallet-adapter-react";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { ChakraProvider } from "@chakra-ui/react"

import 'tailwindcss/tailwind.css';
import '../styles/globals.css';
import "../styles/App.css";
import { Toaster } from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { SOLANA_NETWORK } from "../config/solana";

const network = SOLANA_NETWORK;

const WalletProvider = dynamic(
  () => import("../contexts/ClientWalletProvider"),
  {
    ssr: false,
  }
);

function MyApp({ Component, pageProps, router }: AppProps) {
  const endpoint = useMemo(() => clusterApiUrl(network), []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider>
        <ChakraProvider >
          <AnimatePresence exitBeforeEnter>
            <motion.div key={router.route}
              initial="pageInitial"
              animate="pageAnimate"
              exit="pageExit"
              variants={{
                pageInitial: {
                  opacity: 0,
                  overflowY: 'hidden',
                },
                pageAnimate: {
                  opacity: 1,
                  overflowY: 'hidden',
                },
                pageExit: {
                  // filter: [
                  //   'hue-rotate(0) contrast(100%)',
                  //   'hue-rotate(360deg) contrast(200%)',
                  //   'hue-rotate(45deg) contrast(300%)',
                  //   'hue-rotate(0) contrast(100%)'
                  // ],
                  opacity: 0
                },
              }}>
              <Component key={router.route} {...pageProps} />
              <Toaster
                position="bottom-right"
                reverseOrder={false}
                toastOptions={{
                  style: {
                    background: '#2A2E37',
                    color: '#fff',
                  }
                }}
              />
            </motion.div>
          </AnimatePresence>
        </ChakraProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default MyApp;
