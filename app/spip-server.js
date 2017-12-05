const   bodyParser = require('body-parser'),
        cors = require('cors'),
        logger = require('morgan'),
        passport = require("passport"),
        database = require('./database.js'),
        SPIP = require('./models/spip/spip.js'),
        spipMiddleware = require('./middlewares/inject-spip.js'),
        ValidRoutes = require('./routes/validate/valid-routes.js'),
        strategy = require('./auth/strategy.js');

module.exports = class SpipServer{

    /**
     * Configure un serveur express pour être utilisé avec Spip-node
     * @param {express} app     - Une instance d'un serveur Express
     * @param {object}  config   - Un objet de configuration du serveur spip
     * @param {string}  config.hostname - Le domaine sur lequel le serveur répond
     * @param {array}   config.ipRestriction - Un tableau avc les ip autorisée à interroger le serveur. Les ips doivent être sous la forme ::masque:ip (ex: ::ffff:195.56.139.100)
     * @param {string}  config.racine  - Le chemin où le serveur SPIP doit écouter
     * @param {integer} config.[role=1] - le role minimum pour accèder à l'api
     * @param {object}  config.connectionParam - Obligatoire, les paramètre de connection à la base de donnée SPIP
     * @param {string}  config.secretOrKey - Obligatoire, une clef pour signer les tokens JWT
     * @param {object}  config.boucles - Un objet définissant des boucles supplémentaires
     *
     */
    constructor(app,{hostname=null,ipRestriction=null,racine = '/spip/',roleMinimum=1,connectionParam=throwIfMissing(),secretOrKey=throwIfMissing(), boucles=null}){
        //on charge les modules express dont on a besoin
        this.app = app;
        this.racine = racine;
        this.app.set('secretOrKey',secretOrKey);
        this.app.use(cors());
        this.app.use(logger('dev'));
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({extended:true}));
        this.app.use(function (req, res, next) {
            console.log("ip",req.ip,"appelle sur domaine",req.hostname,"/",req.originalUrl);
            if(hostname && req.hostname != hostname){
                console.log("pas le bon domaine, ",hostname,"demandé");
                res.status(403).send();

            } else if(ipRestriction && (ipRestriction.indexOf(req.ip) == -1 )) {
                res.status(403).send();

            } else{
                console.log("ok domaine:",req.hostname," autorisé sur ",hostname);
                req.roleMinimum = roleMinimum;
                next();
            }

        });

        //Création du pool de connection à la base
        const db = new database(connectionParam);
        this.spip = new SPIP(db);

        passport.use(strategy(this.spip,secretOrKey));
        this.app.use(passport.initialize());
        this.app.use(spipMiddleware(this.spip));
        this.boucles = require('./models/spip/boucles.js');
        if(boucles && this.boucles.add(boucles)) ValidRoutes.generate();

        //créé une propriété req.requete.connection qui sera accessible dans ttes les routes
        this.app.param('connection', (req, res, next,id)=> {

            if(db.connectionList.indexOf(id)>-1){
                db.activeConnection = id;
                req.requete ={connection : id};
                next();
            }else{
                res.status(404).send();
            }
            console.log('connection à ',id);

        });

        this.router = require('./routes');
        this.app.use(this.racine+':connection/',this.router);

    }

    endConfig(){
        //404
        this.router.all('*', function(req, res){
            res.status(404).send({
                "status":"error",
                "message":"la route "+req.method+" "+req.path+" est inconnue"
            });
        });
    }

    get model(){
        return this.spip;
    }


}
function throwIfMissing() {
    throw new Error('Missing parameter');
}