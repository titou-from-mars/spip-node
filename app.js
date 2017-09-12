const express = require('express'),
    bodyParser = require('body-parser'),
    logger = require('morgan'),
    connectionParam = require('./config/connection.json'),
    database = require('./app/database.js'),
    SPIP = require('./app/models/spip/spip.js'),
    spipMiddleware = require('./app/middlewares/inject-spip.js'),
    //Auth
    jwt = require('jsonwebtoken'),    
    passport = require("passport"),
    passportJWT = require("passport-jwt");
    
    var ExtractJwt = passportJWT.ExtractJwt;
    var JwtStrategy = passportJWT.Strategy;

    // configure JWT, passport...
    var jwtOptions = {}
    jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt');//simule comportement 2.x.x . Il faudra peut-être adopter  ExtractJwt.fromAuthHeaderAsBearerToken() de la 3.x.x
    jwtOptions.secretOrKey = require('./config/security.json').secretOrKey; 
    
var app = express();
//Création du pool de connection à la base
var db = new database(connectionParam);
var spip = new SPIP(db.pool);


const strategy = new JwtStrategy(jwtOptions, function (jwt_payload, next) {
    //console.log('payload received', jwt_payload);    
    spip.select('auteur',{criteres:{id_auteur:jwt_payload.id}})
    self.SPIP.auteurs.get(jwt_payload.id).then((user)=>{
        user = user[0];
        if (user) {
            next(null, user);
        } else {
            next(null, false);
        }

    });

});
passport.use(strategy);
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