var express = require('express'),
    bodyParser = require('body-parser'),
    logger = require('morgan'),
    connectionParam = require('./config/connection.json'),
    database = require('./app/database.js'),
    spip = require('./app/models/spip/spip.js');
var app = express();
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(require('./app/routes'));

//conection à la base
var db = new database(connectionParam);
var connection;
db.connect((err,con)=>{
    if(err) console.log("Erreur", err);
    else{
        console.log("connection à Mysql réussie !");
        connection = con;
    }
});

app.listen(3000,()=>{
    console.log('Serveur SPIP-Node écoute sur le port 3000');
});