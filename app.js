var express = require('express'),
    bodyParser = require('body-parser'),
    logger = require('morgan');
var app = express();
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(require('./app/routes'));
app.listen(3000,function(){
    console.log('Serveur SPIP-Node écoute sur le port 3000');
});