const express = require('express'), 
roles = require('../auth/roles'),
definitions = require('../models/spip/boucles.js').definitions,
validRoutes = require('./validate/valid-routes.js'),
router = express.Router();



router.patch('/publie/:boucle'+validRoutes.route+'/:id(\\d+)/',autorise(roles.ADMIN),function(req,res){
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
    let query = {};
    query['criteres']={};
    query['set'] = {statut:statut};
    let id_name = definitions[req.params.boucle].id;
    query['criteres'][id_name] = req.params.id;
    req.spip.update(boucle,query)
    .then((retour)=>{
        res.json({
            "status":"success",
            "data":retour
        })

    })
    .catch((e)=>{
        res.status(404).json(
            {
                "status":"error",
                "message":e.message
            })

    });

}






module.exports = router;