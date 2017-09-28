const express = require('express'), 
      validate = require('./validate/valid-parameters.js'),
      validRoutes = require('./validate/valid-routes.js');  
      router = express.Router(),
      roles = require('../auth/roles');



router.get('(/:boucle'+validRoutes.route+'){1}s/:criteres',autorise(roles.PUBLIC),function(req,res){
    //recupère des éléments d'une boucle SPIP. 
    validate.mustBeJSON(req.params.criteres,res);//si non valide renvoi une erreur 400
    req.spip.select(req.params.boucle,JSON.parse(req.params.criteres))
    .then((retour)=>{
        //console.log('retour',retour);
        res.json(
            {
                "status":"success",
                "data":retour
            });
    })
    .catch((e)=>res.status(404).json(
            {
                "status":"error",
                "message":e.message
            })
    );
});


router.patch('(/:boucle'+validRoutes.route+'){1}s/:criteres',autorise(roles.ADMIN),function(req,res){
    //met à jour des éléments
    
    validate.mustBeJSON(req.params.criteres,res);//si non valide renvoi une erreur 400

    let query = JSON.parse(req.params.criteres);
    query['set'] = req.body;
    
        req.spip.update(req.params.boucle,query)
        .then((retour)=>{
            //console.log('retour',retour);
            res.json(
                {
                    "status":"success",
                    "data":retour
                });
        })
        .catch((e)=>res.status(404).json(
                {
                    "status":"error",
                    "message":e.message
                })
        );
});

router.delete('(/:boucle'+validRoutes.route+'){1}s/:criteres',autorise(roles.WEBMESTRE),function(req,res){
    //supprime des éléments
    validate.mustBeJSON(req.params.criteres,res);//si non valide renvoi une erreur 400
    
        req.spip.delete(req.params.boucle,JSON.parse(req.params.criteres))
        .then((retour)=>{
            //console.log('retour',retour);
            res.json(
                {
                    "status":"success",
                    "data":retour
                });
        })
        .catch((e)=>res.status(404).json(
                {
                    "status":"error",
                    "message":e.message
                })
        );
});

module.exports = router;