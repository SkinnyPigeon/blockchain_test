const Blockchain = require ('./blockchain'); 
const bitcoin = new Blockchain (); 


const previousBlockHash = '87765DA6CCF0668238C1D27C35692E11';
const currentBlockData = [
    {
        amount: 10,
        sender: 'C4CEE9C0E5CD571',
        recipient: '3A3F6E462D48E9',  
    }  
]
const nonce = 100;
console.log(bitcoin.hashBlock(previousBlockHash, currentBlockData, nonce));