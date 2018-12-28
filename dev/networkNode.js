const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');
const uuid = require('uuid/v1');
const rp = require('request-promise');

const pidgeCoin = new Blockchain();
const nodeAddress = uuid().split('-').join('');

const port = process.argv[2]; 

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/blockchain', function(req, res) {
    res.send(pidgeCoin);
});

app.post('/transaction', function(req, res) {
  const newTransaction = req.body;
  const blockIndex = pidgeCoin.addTransactionToPendingTransactions(newTransaction);
  res.json({ note: `Transaction will be added in block ${blockIndex}.`});
});

app.post('/transaction/broadcast', function(req, res){
 const newTransaction = pidgeCoin.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient);
 pidgeCoin.addTransactionToPendingTransactions (newTransaction);
 const requestPromises = []; 
 pidgeCoin.networkNodes.forEach(networkNodeUrl => {
    const requestOptions = {
    uri: networkNodeUrl + '/transaction',
        method: 'POST',
        body: newTransaction,
        json: true
    };
    requestPromises.push(rp(requestOptions));
  });
  Promise.all(requestPromises).then(data => {
    res.json({note: 'Transaction created and broadcast successfully'})
  })
});

app.get('/mine', function(req, res) {
  const lastBlock = pidgeCoin.getLastBlock();
  const previousBlockHash = lastBlock['hash'];
  const currentBlockData = {
    transactions: pidgeCoin.pendingTransactions,
    index: lastBlock['index'] + 1
  };
  const nonce = pidgeCoin.proofOfWork(previousBlockHash, currentBlockData);
  const blockHash = pidgeCoin.hashBlock(previousBlockHash, currentBlockData, nonce);
  const newBlock = pidgeCoin.createNewBlock(nonce, previousBlockHash, blockHash);

  const requestPromises = [];
  pidgeCoin.networkNodes.forEach(networkNodeUrl => {
    const requestOptions = {
      uri: networkNodeUrl + '/receive-new-block',
      method: 'POST',
      body: { newBlock: newBlock },
      json: true
    };

    requestPromises.push(rp(requestOptions));
  });

  Promise.all(requestPromises)
  .then(data => {
    const requestOptions = {
      uri: pidgeCoin.currentNodeUrl + '/transaction/broadcast',
      method: 'POST',
      body: {
        amount: 12.5,
        sender: "00",
        recipient: nodeAddress
      },
      json: true
    };

    return rp(requestOptions);
  })
  .then(data => {
    res.json({
      note: "New block mined & broadcast successfully",
      block: newBlock
    });
  });
});

app.post('/receive-new-block', function(req, res){
  const newBlock = req.body.newBlock;
  const lastBlock = pidgeCoin.getLastBlock();
  const correctHash = lastBlock.hash === newBlock.previousBlockHash;
  const correctIndex = lastBlock['index'] + 1 === newBlock['index'];
  if (correctHash && correctIndex) {
    pidgeCoin.chain.push(newBlock);
    pidgeCoin.pendingTransactions = [];
    res.json({
        note: 'New block received and accepted',
        newBlock: newBlock
    })
  } else {
    res.json({
        note:'New block rejected',
        newBlock: newBlock
    });  
  };
});

app.post('/register-and-broadcast-node', function (req, res) {
  const newNodeUrl = req.body.newNodeUrl;
  if(pidgeCoin.networkNodes.indexOf(newNodeUrl) === -1) pidgeCoin.networkNodes.push(newNodeUrl);

  const regNodesPromises = [];
  pidgeCoin.networkNodes.forEach(networkNodeUrl => {
    const requestOptions = {
      uri: networkNodeUrl + '/register-node',
      method: 'POST',
      body: {newNodeUrl:newNodeUrl},
      json: true
    };
    regNodesPromises.push(rp(requestOptions));
  }); 

  Promise.all(regNodesPromises).then(data => {
    const bulkRegisterOptions = {
      uri: newNodeUrl + '/register-nodes-bulk',
      method: 'POST',
      body: {allNetworkNodes: [...pidgeCoin.networkNodes, pidgeCoin.currentNodeUrl]},
      json: true
    };
    return rp(bulkRegisterOptions);
  }).then(data => {
    res.json({note: 'New Node registered with the network successfully'})
  });
});

app.post('/register-node', function (req, res) {
  const newNodeUrl = req.body.newNodeUrl;
  const nodeNotAlreadyPresent = pidgeCoin.networkNodes.indexOf(newNodeUrl) === -1;
  const notCurrentNode = pidgeCoin.currentNodeUrl !== newNodeUrl;

  if(nodeNotAlreadyPresent && notCurrentNode) pidgeCoin.networkNodes.push(newNodeUrl);
  res.json({note: 'New Node registered successfully'})
});

app.post('/register-nodes-bulk', function (req, res) {
  const allNetworkNodes = req.body.allNetworkNodes;
  allNetworkNodes.forEach(networkNodeUrl => {
    const nodeNotAlreadyPresent = pidgeCoin.networkNodes.indexOf(networkNodeUrl) === -1;
    const notCurrentNode = pidgeCoin.currentNodeUrl !== networkNodeUrl;
    if(nodeNotAlreadyPresent && notCurrentNode) pidgeCoin.networkNodes.push(networkNodeUrl);
  });

  res.json({note: 'Bulk registration successful'})
});

app.get('/consensus', function(req, res) {
  const requestPromises = [];
  pidgeCoin.networkNodes.forEach(networkNodeUrl => {
    const requestOptions = {
      uri: networkNodeUrl + '/blockchain',
      method: 'GET',
      json: true
    }
    requestPromises.push(rp(requestOptions));
  });
  Promise.all(requestPromises).then(blockchains => {
    const currentChainLength = pidgeCoin.chain.length;
    let maxChainLength = currentChainLength;
    let newLongestChain = null;
    let newPendingTransactions = null;
    blockchains.forEach(blockchain => {
      if(blockchain.chain.length > maxChainLength) {
        maxChainLength = blockchain.chain.length;
        newLongestChain = blockchain.chain;
        newPendingTransactions = blockchains.pendingTransactions;
      };
    });
    if(!newLongestChain || (newLongestChain && !pidgeCoin.chainIsValid(newLongestChain))) {
      res.json({
        note: 'Current chain has not been replaced',
        chain: pidgeCoin.chain
      });
    } else {
      pidgeCoin.chain = newLongestChain;
      pidgeCoin.pendingTransactions = newPendingTransactions;
      res.json({
        note: 'This chain has been replaced',
        chain: pidgeCoin.chain
      });
    };
  });         
});

app.get('/block/:blockHash', function(req, res) { 
  const blockHash = req.params.blockHash;
  const correctBlock = pidgeCoin.getBlock(blockHash);
  res.json({
    block: correctBlock
  })
});

app.get('/transaction/:transactionId', function(req, res) {
  const transactionId = req.params.transactionId;
  const transactionData = pidgeCoin.getTransaction(transactionId);
  res.json({
    transaction: transactionData.transaction,
    block: transactionData.block
  });
});

app.get('/address/:address', function(req, res) {
  const address = req.params.address;
  const addressData = pidgeCoin.getAddressData(address);
  res.json({
    addressData: addressData
  })
});

app.listen(port, function() {
    console.log(`Listening on port ${port}...`);
});