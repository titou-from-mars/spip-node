var express = require('express'),
    bodyParser = require('body-parser'),
    logger = require('morgan');
var app = express();
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.get('/',function(req,res,next){
    res.send('Merci  de choisir une collection SPIP, ex, /articles/');
})
app.listen(3000,function(){
    console.log('Serveur SPIP-Node écoute sur le port 3000');
});