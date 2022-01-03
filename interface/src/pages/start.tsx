// 1. api upload csv
// 1. api parse csv 
// 1. api create a batch in psdb (default status pending)
// 1. api create a wallet 
// 1. api bulk import txns
//
// transfer total amount to the wallet
// confirm transfer
// redirect to start

import { Box, Button, Container, Heading, Link, Spinner } from "@chakra-ui/react";
import { ChevronRightIcon, RepeatIcon } from "@chakra-ui/icons";
import { useEffect, useMemo, useState } from "react";
import transferSOL from "../lib/transferSol";
import useUser from "../lib/useUser";
import Header from "../views/components/Header";
import { useToast } from "@chakra-ui/react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import Dropzone, { useDropzone } from "react-dropzone";
import axios from "axios";
import { useRouter } from "next/router";
import useSWR from "swr";

// 2. api start batch 
// 2. api pull txns from db
// 2. api push into redis queue

export default function Start() {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const toast = useToast();
  const router = useRouter();
  const [amount, setAmount] = useState(null);
  const [records, setRecords] = useState(null);
  const [batchId, setBatchId] = useState(null);
  const [retryPayment, setRetryPayment] = useState(false);
  const [processingCSV, setProcessingCSV] = useState(false);
  const [reciever, setReciever] = useState(null);
  const [uploadCsv, setUploadCsv] = useState(true);
  const [transferring, setTransferring] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const { user } = useUser({
    redirectTo: "/",
  });

  useEffect(() => {
    if (publicKey && user && (publicKey?.toString() !== user?.address)) {
      axios.get('/api/logout');
      router.push("/");
    }
  }, [publicKey])

  const transferSolana = () => {
    if (amount && publicKey && reciever && batchId) {
      setTransferring(true);
      transferSOL(amount, publicKey, signTransaction, connection, reciever, toast)
        .then(() => {
          setTransferring(false);
          setRedirecting(true);
          router.push(`/drops/${batchId}`);
        })
        .catch((err) => {
          // console.log(err);
          setRetryPayment(true);
          setTransferring(false);

          toast({
            title: `Transferring sol failed!`,
            status: 'error',
            isClosable: true,
          })
        });
    }
  }

  useEffect(() => {
    transferSolana();
  }, [amount]);

  const config = { headers: { 'Content-Type': 'multipart/form-data' } };
  let fd = new FormData();

  return (
    <div>
      <Header />
      <Container maxW="3xl" centerContent padding={3}>
        <div>
          {publicKey ? uploadCsv ? <>
            <Box padding="4" maxW="3xl" className="mt-20">
              <Heading> Upload your CSV </Heading>
              <br />
              CSV should contain only two rows, to (public_addresses) & amount (in lamports).<br />
              Right now we only support sol token airdrops.<br />
              <br />
              Take this csv for example: <u><Link onClick={()=> window.open('/example.csv', '_blank')}>1k.csv</Link></u>
            </Box>
            <div className="border h-36 border-dashed rounded-lg p-8 mt-6 bg-gray-800">
              {!retryPayment && !processingCSV ? <Dropzone onDrop={async (acceptedFiles) => {
                try {
                  acceptedFiles.map((file) => {
                    fd.append('File[]', file);
                  });

                  setProcessingCSV(true);
                  const response = await axios.post(`api/uploadcsv`, fd, config);

                  setProcessingCSV(false);
                  setUploadCsv(false);
                  
                  setReciever(response.data.walletPublicKey);
                  setAmount(response.data.total_amount);
                  setRecords(response.data.records);
                  setBatchId(response.data.batchId);
                } catch (err) {
                  setProcessingCSV(false);
                  toast({
                    title: 'Error occurred While uploading',
                    position: 'bottom-right',
                    isClosable: true,
                    status: 'error',
                  });
                }
              }}>
                {({ getRootProps, getInputProps }) => (
                  <section>
                    <div {...getRootProps()}>
                      <input {...getInputProps({ accept: 'text/csv', maxFiles: 1 })} />
                      <p>Drag n Drop csv here, or <Link><u>click here to select file</u></Link></p>
                    </div>
                  </section>
                )}
              </Dropzone> : ''}
              {(processingCSV && !amount) ?
                <Box padding="4" maxW="2xl" className="">
                  <Heading>Uploading CSV <Spinner size="lg" /></Heading>
                </Box> : ''}
            </div>
          </> : (!processingCSV && amount) &&
        <Box padding="4" maxW="3xl" className="mt-20">
          <Heading>Transfer total amount of tokens to us.</Heading>
          <br />
          All the airdrops via Parachute can happen asynchronously.<br />
          That means you can watch Netflix after this transfer.🍿 <br />
          <br />
          {amount ? <p>Approve <b>{amount}</b> For {records} Records.</p> : ''}
          <br />
          <Button rightIcon={retryPayment ? <RepeatIcon /> : <ChevronRightIcon />}
            onClick={(e) => { if (!e.isDefaultPrevented()) transferSolana() }}
            size="lg"
            colorScheme="teal"
            isLoading={transferring || redirecting}
          > {retryPayment ? 'Retry' : 'Do'} Payment </Button>
        </Box> : <div>
          <Box className="mt-14">
            <Heading> Connect your wallet again. </Heading>
          </Box>
        </div>}
    </div>
      </Container >
    </div >
  )
}
