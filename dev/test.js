const Blockchain = require('./blockchain');
const bitcoin = new Blockchain();

const bc1 = 
  {
  "chain": [
  {
  "index": 1,
  "timestamp": 1546008687292,
  "transactions": [],
  "nonce": 100,
  "hash": "0",
  "previousBlockHash": "0"
  },
  {
  "index": 2,
  "timestamp": 1546008711882,
  "transactions": [],
  "nonce": 18140,
  "hash": "0000b9135b054d1131392c9eb9d03b0111d4b516824a03c35639e12858912100",
  "previousBlockHash": "0"
  },
  {
  "index": 3,
  "timestamp": 1546008766110,
  "transactions": [
  {
  "amount": 12.5,
  "sender": "00",
  "recipient": "0dc336d00ab011e98f9427db2476b05d",
  "transactionId": "1c6f2a400ab011e98f9427db2476b05d"
  },
  {
  "amount": 600,
  "sender": "Z9PNS89GFN9RASNF89",
  "recipient": "ADSDF8DQZSD9FNASD",
  "transactionId": "2fb84c800ab011e98f9427db2476b05d"
  },
  {
  "amount": 400,
  "sender": "Z9GNS89GFN9RASNF89",
  "recipient": "ADSDFTDQZSD9FNASD",
  "transactionId": "343019000ab011e98f9427db2476b05d"
  }
  ],
  "nonce": 65957,
  "hash": "00001bdf4b39b44f48be7cc3fa20f062983dc43e88d43292114b0f6a0e7c4f9d",
  "previousBlockHash": "0000b9135b054d1131392c9eb9d03b0111d4b516824a03c35639e12858912100"
  }
  ],
  "pendingTransactions": [
  {
  "amount": 12.5,
  "sender": "00",
  "recipient": "0dc336d00ab011e98f9427db2476b05d",
  "transactionId": "3cbe31100ab011e98f9427db2476b05d"
  }
  ],
  "currentNodeUrl": "http://localhost:3001",
  "networkNodes": []
}

console.log('VALID:' , bitcoin.chainIsValid(bc1.chain));