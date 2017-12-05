const express = require('express'),
      serverParam = require('./config/server.json'),
      secuParam = require('./config/security.json'),
      SpipServer = require('./index.js'),
      app = express();

app.set('env',serverParam.env);
app.set('case sensitive routing', serverParam.caseSensitive);
app.set('x-powered-by', serverParam.xPoweredBy);
let config ={
    hostname:serverParam.hostname,
    ipRestriction:serverParam.ipRestriction,
    racine:serverParam.racine,
    roleMinimum:secuParam.roleMinimum,
    connectionParam:require('./config/connection.json').connections,
    secretOrKey:secuParam.secretOrKey,
    boucles:{velo: {
        jointures: {
            id_mot: "mot",
            id_auteur: "auteur",
            id_document: "document"
        },
        table: "spip_velos",
        table_jointures: null,
        nom: "velo",
        id: "id_velo",
        maj: true
        }
    }
};
const spip = new SpipServer(app,config);
//on ajoute une route custom qui utilisera le système d'authentifcation et de droits de spip
spip.router.get('/coffee',autorise(roles.PUBLIC),function(req,res){
    res.status(418).send("I'm a teapot");
});
//on a fini d'ajouter nos routes custom, donc on finalise la config des routes spip (aka, ts autre appel de route passe en 404)
spip.endConfig();

app.listen(serverParam.port,()=>{
    console.log('Serveur écoute sur le port '+serverParam.port);
});