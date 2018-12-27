const Blockchain = require('./blockchain');

const bitcoin = new Blockchain();
console.log(bitcoin);

bitcoin.createNewBlock();
console.log(bitcoin);

bitcoin.createNewBlock(2389,'OIUOEREDHKHKD','78s97d4x6dsf');
bitcoin.createNewBlock(2389,'OIUOEREDHKHKD','78s97d4x6dsf');
bitcoin.createNewBlock(2389,'OIUOEREDHKHKD','78s97d4x6dsf');
console.log(bitcoin);
