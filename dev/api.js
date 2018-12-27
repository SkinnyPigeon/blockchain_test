const express = require('express');
const app = express();

app.get('/blockchain', function (req, res) {

});

app.post('/transaction', function(req, res) {
    console.log(req.body);
    res.send(`The amount of the transaction is ${req.body.amount} bitcoin.`);
});

app.get('/mine', function(req, res) {

});

app.listen(3000, function(){
    console.log('listening on port 3000...'); 

});