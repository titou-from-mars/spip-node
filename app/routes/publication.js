const express = require('express'), 
roles = require('../auth/roles'),
autorise = require('../auth/autorise.js');
rise = require('../auth/rise.js'),
definitions = require('../models/spip/boucles.js'),
validRoutes = require('./validate/valid-routes.js'),
router = express.Router();



router.patch('/publie/:boucle'+validRoutes.route+'/:id(\\d+)/',rise,autorise(roles.ADMIN),function(req,res){
    //Met le statut d'un élément SPIP à "Publié en ligne"
    statut(req,res,req.params.boucle,req.params.id,'publie');
});

router.patch('/refuse/:boucle'+validRoutes.route+'/:id(\\d+)/',autorise(roles.ADMIN),function(req,res){
    //Met le statut d'un élément SPIP à "Refusé"
    statut(req,res,req.params.boucle,req.params.id,'refuse');
});

router.patch('/poubelle/:boucle'+validRoutes.route+'/:id(\\d+)/',autorise(roles.ADMIN),function(req,res){
    //Met le statut d'un élément SPIP à "à la poubelle"
    statut(req,res,req.params.boucle,req.params.id,'poubelle');
});

router.patch('/redac/:boucle'+validRoutes.route+'/:id(\\d+)/',autorise(roles.ADMIN),function(req,res){
    //Met le statut d'un élément SPIP à "en cours de rédaction"
    statut(req,res,req.params.boucle,req.params.id,'prepa');
});

router.patch('/eval/:boucle'+validRoutes.route+'/:id(\\d+)/',autorise(roles.ADMIN),function(req,res){
    //Met le statut d'un élément SPIP à "proposé à l'évaluation"
    statut(req,res,req.params.boucle,req.params.id,'prop');
});

function statut(req,res,boucle,id,statut){    
    req.requete['criteres']={};
    req.requete['set'] = {statut:statut};
    let id_name = definitions.getId(req.params.boucle);
    req.requete['criteres'][id_name] = req.params.id;
    req.spip.update(boucle,req.requete)
    .then((retour)=>{
        res.json({
            "status":"success",
            "data":retour
        })

    })
    .catch((e)=>{
        res.status(500).json(
            {
                "status":"error",
                "message":e.message
            })

    });

}






module.exports = router;