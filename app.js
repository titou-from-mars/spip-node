const express = require('express'),
    bodyParser = require('body-parser'),
    logger = require('morgan'),
    passport = require("passport"),
    connectionParam = require('./config/connection.json'),
    database = require('./app/database.js'),
    SPIP = require('./app/models/spip/spip.js'),
    spipMiddleware = require('./app/middlewares/inject-spip.js'),
    strategy = require('./app/auth/strategy.js');
    
var app = express();
//Création du pool de connection à la base
var db = new database(connectionParam);
var spip = new SPIP(db.pool);

passport.use(strategy(spip));
app.use(passport.initialize());

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