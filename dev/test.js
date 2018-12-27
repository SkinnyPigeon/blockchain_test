const Blockchain = require('./blockchain');

const bitcoin = new Blockchain();
console.log(bitcoin);

bitcoin.createNewBlock();
console.log(bitcoin);
