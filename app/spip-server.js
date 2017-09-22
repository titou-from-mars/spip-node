const   bodyParser = require('body-parser'),
        logger = require('morgan'),
        passport = require("passport"),
        connectionParam = require('../config/connection.json'),
        database = require('./database.js'),
        SPIP = require('./models/spip/spip.js'),
        spipMiddleware = require('./middlewares/inject-spip.js'),
        strategy = require('./auth/strategy.js');

module.exports = class SpipServer{

    /**
     * Configure un serveur express pour être utilisé avec Spip-node
     * @param {express} app     - Une instance d'un serveur Express
     * @param {string}  racine  - Le chemin où le serveur SPIP doit écouter
     */ 
    constructor(app,racine){
        //on charge les modules express dont on a besoin
        app.use(logger('dev'));
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({extended:true}));

        //Création du pool de connection à la base
        const db = new database(connectionParam);
        const spip = new SPIP(db.pool);
        
        passport.use(strategy(spip));
        app.use(passport.initialize());    
        app.use(spipMiddleware(spip));    
        app.use(racine,require('./routes'));

    }

}