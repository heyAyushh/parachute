// 1000000000 Lamports = 1 SOL
const json2csv = require('json2csv');
const web3 = require('@solana/web3.js');
const { parse } = require('json2csv');

const fields = ['to', 'lamports'];
const opts = { fields };

function getRandomInt(max) {
  return Math.floor(Math.random() * 10000000);
}

const createData = (n=5000, data = []) => {
  if(n==0){
    return;
  }

  const pair = web3.Keypair.generate();
  const lamports = getRandomInt();

  return data.push(createData(n-1))
}

try {
  const csv = parse(myData, opts);
} catch (err) {
  console.error(err);
}

