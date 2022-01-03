import { FC, useMemo, useState } from "react";
import { useWallet, useConnection, } from "@solana/wallet-adapter-react";
import {
  WalletMultiButton,
  WalletConnectButton,
} from "@solana/wallet-adapter-react-ui";
import styles from "./index.module.css";
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import router from 'next/router';
import { WalletNotConnectedError, WalletSignTransactionError } from "@solana/wallet-adapter-base";
import {
  Button, Heading, Modal,
  ModalBody, ModalCloseButton, ModalContent,
  ModalFooter, ModalHeader, ModalOverlay,
  useDisclosure
} from "@chakra-ui/react";
import Header from "../components/Header";

export const HomeView: FC = ({ }) => {
  const { publicKey, signMessage, connect, connected, disconnecting } = useWallet();
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [loadingLetsGo, setLoadingLetsGo] = useState(false);
  const [challengeStr, setChallengeStr] = useState('');

  if (disconnecting)
    axios.get('/api/logout').catch(err => console.log(err));

  const loginSign = async () => {
    try {
      await connect();

      if (!publicKey || !signMessage) {
        return
      }

      setLoadingLetsGo(true);

      const challenge_req = await axios({
        method: "get",
        url: `/api/createChallenge?address=${publicKey}`
      })

      onOpen();
      setChallengeStr(challenge_req.data.challenge.split(' ')[5]);

      const data = new TextEncoder().encode(challenge_req.data.challenge);
      const signedMsg = await signMessage(data);
      // @ts-expect-error typescript doesn't know about UnitArray and Array
      const signature_array = [...signedMsg];

      setLoadingLetsGo(false);

      const backend_res_raw = await axios({
        method: "post",
        url: `/api/submitChallenge`,
        data: {
          address: publicKey.toString(),
          signature: signature_array
        }
      });

      toast.success('Loggedin! ');
      router.push('/start ');
    } catch (err: any) {
      setLoadingLetsGo(false);
      if (err instanceof WalletSignTransactionError)
        toast.error('Verification cancelled!');
      else if (err instanceof WalletNotConnectedError)
        toast.error('Please connect the wallet above!');
      else
        toast.error('Something went wrong!');
    }
  };


  return (
    <div>
      <Header />
      <div className="container mx-auto max-w-6xl p-8 2xl:px-0">
        <div className={styles.container}>

          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader> Verify your Connection to parachute </ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                Make sure your message is <br />
                <Heading>{challengeStr}</Heading>
              </ModalBody>

              <ModalFooter>
                <Button colorScheme="blue" mr={3} onClick={onClose}>
                  Okay
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>

          <div className="text-center pt-2">
            <div className="hero min-h-16 py-20">
              <div className="text-center hero-content">
                <div className="max-w-md">
                  <h1 className="mb-5 text-5xl font-bold">
                    Parachute for <SolanaLogo />
                  </h1>
                  <p className="mb-5">
                    This web app is a Airdropping tool for solana.
                    Can be used for airdrop campaigns, or any use case that needs transfers to a large number of addresses.
                  </p>

                  <button className={`btn btn-primary mt-20 mb-20 ${loadingLetsGo ? 'loading' : ''}`}
                    disabled={!connected}
                    onClick={async (e) => {
                      if (!e.isDefaultPrevented()) {
                        try {
                          await loginSign();
                        } catch (err) {
                          toast.error('There was some error, Please try again later.')
                        }
                      }
                    }}> Lets goooooo </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SolanaLogo = () => (
  <svg width="46" height="35" xmlns="http://www.w3.org/2000/svg" className="inline">
    <defs>
      <linearGradient
        x1="90.737%"
        y1="34.776%"
        x2="35.509%"
        y2="55.415%"
        id="a"
      >
        <stop stopColor="#00FFA3" offset="0%" />
        <stop stopColor="#DC1FFF" offset="100%" />
      </linearGradient>
      <linearGradient x1="66.588%" y1="43.8%" x2="11.36%" y2="64.439%" id="b">
        <stop stopColor="#00FFA3" offset="0%" />
        <stop stopColor="#DC1FFF" offset="100%" />
      </linearGradient>
      <linearGradient
        x1="78.586%"
        y1="39.317%"
        x2="23.358%"
        y2="59.956%"
        id="c"
      >
        <stop stopColor="#00FFA3" offset="0%" />
        <stop stopColor="#DC1FFF" offset="100%" />
      </linearGradient>
    </defs>
    <g fillRule="nonzero" fill="none">
      <path
        d="M7.256 26.713c.27-.27.64-.427 1.033-.427h35.64a.73.73 0 0 1 .517 1.247l-7.04 7.04c-.27.27-.64.427-1.034.427H.732a.73.73 0 0 1-.516-1.246l7.04-7.04Z"
        fill="url(#a)"
        transform="translate(.98)"
      />
      <path
        d="M7.256.427C7.536.157 7.907 0 8.289 0h35.64a.73.73 0 0 1 .517 1.246l-7.04 7.04c-.27.27-.64.428-1.034.428H.732a.73.73 0 0 1-.516-1.247l7.04-7.04Z"
        fill="url(#b)"
        transform="translate(.98)"
      />
      <path
        d="M37.405 13.486c-.27-.27-.64-.427-1.033-.427H.732a.73.73 0 0 0-.516 1.246l7.04 7.04c.27.27.64.428 1.033.428h35.64a.73.73 0 0 0 .517-1.247l-7.04-7.04Z"
        fill="url(#c)"
        transform="translate(.98)"
      />
    </g>
  </svg>
);
