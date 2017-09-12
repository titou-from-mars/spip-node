var express = require('express'),
    bodyParser = require('body-parser'),
    logger = require('morgan'),
    connectionParam = require('./config/connection.json'),
    database = require('./app/database.js'),
    spip = require('./app/models/spip/spip.js'),
    spipMiddleware = require('./app/middlewares/inject-spip.js');
var app = express();
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(require('./app/routes'));

//Création du pool de connection à la base
var db = new database(connectionParam);
app.use(spipMiddleware(db.pool));

app.listen(3000,()=>{  
    var SPIP = new spip(db.pool);    
    SPIP.meta.get('nom_site')
    .then((retour)=>console.log("Serveur",retour[0].valeur, "écoute sur le port 3000"))
    .catch((e)=>console.log("Erreur :", e));
    
});