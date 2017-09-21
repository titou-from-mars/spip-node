const express = require('express'), 
roles = require('../auth/roles'),
router = express.Router();



router.patch('/publie/:collection/:id',autorise(roles.ADMIN),function(req,res){
    //Met le statut d'un élément SPIP à "Publié en ligne"
});

router.patch('/refuse/:collection/:id',autorise(roles.ADMIN),function(req,res){
    //Met le statut d'un élément SPIP à "Refusé"
});

router.patch('/poubelle/:collection/:id',autorise(roles.ADMIN),function(req,res){
    //Met le statut d'un élément SPIP à "à la poubelle"
});

router.patch('/redac/:collection/:id',autorise(roles.REDACTEUR),function(req,res){
    //Met le statut d'un élément SPIP à "en cours de rédaction"
});

router.patch('/eval/:collection/:id',autorise(roles.REDACTEUR),function(req,res){
    //Met le statut d'un élément SPIP à "proposé à l'évaluation"
});


module.exports = router;