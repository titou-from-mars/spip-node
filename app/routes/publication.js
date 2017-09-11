var express = require('express'), 
router = express.Router();



router.patch('/publie/:collection/:id',function(req,res){
    //Met le statut d'un élément SPIP à "Publié en ligne"
});

router.patch('/refuse/:collection/:id',function(req,res){
    //Met le statut d'un élément SPIP à "Refusé"
});

router.patch('/poubelle/:collection/:id',function(req,res){
    //Met le statut d'un élément SPIP à "à la poubelle"
});

router.patch('/redac/:collection/:id',function(req,res){
    //Met le statut d'un élément SPIP à "en cours de rédaction"
});

router.patch('/eval/:collection/:id',function(req,res){
    //Met le statut d'un élément SPIP à "proposé à l'évaluation"
});


module.exports = router;