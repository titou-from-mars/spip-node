const   bodyParser = require('body-parser'),
        logger = require('morgan'),
        passport = require("passport"),        
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
    constructor(app,{racine = '/spip/',roleMinimum=1,connectionParam=throwIfMissing(),secretOrKey=throwIfMissing()}){
        //on charge les modules express dont on a besoin        
        this.app = app;  
        this.app.set('secretOrKey',secretOrKey);      
        this.app.use(logger('dev'));
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({extended:true}));
        this.app.use(function (req, res, next) {
            req.roleMinimum = roleMinimum;
            next();
        });

        //Création du pool de connection à la base
        const db = new database(connectionParam);
        const spip = new SPIP(db.pool);
        
        passport.use(strategy(spip,secretOrKey));
        this.app.use(passport.initialize());    
        this.app.use(spipMiddleware(spip));   
        this.router = require('./routes'); 
        this.app.use(racine,this.router);        
        
    }

    endConfig(){
        //404
        this.router.all('*', function(req, res){
            res.status(404).send("Ressource inconnue");
        });
    }

}
function throwIfMissing() {
    throw new Error('Missing parameter');
}