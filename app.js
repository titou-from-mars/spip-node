var express = require('express'),
    bodyParser = require('body-parser'),
    logger = require('morgan'),
    connectionParam = require('./config/connection.json'),
    database = require('./app/database.js'),
    spip = require('./app/models/spip/spip.js'),
    spipMiddleware = require('./app/middlewares/inject-spip.js');
var app = express();
//Création du pool de connection à la base
var db = new database(connectionParam);
var spip = new spip(db.pool);
app.use(spipMiddleware(spip));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(require('./app/routes'));



app.listen(3000,()=>{  
        
    spip.meta.get('nom_site')
    .then((retour)=>console.log("Serveur",retour[0].valeur, "écoute sur le port 3000"))
    .catch((e)=>console.log("Erreur :", e));
    
});