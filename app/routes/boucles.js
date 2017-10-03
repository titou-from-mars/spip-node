const express = require('express'), 
      validate = require('./validate/valid-parameters.js'),
      validRoutes = require('./validate/valid-routes.js');  
      router = express.Router(),
      roles = require('../auth/roles');



router.get('(/:boucle'+validRoutes.route+'){1}s/:criteres',autorise(roles.PUBLIC),function(req,res){
    //recupère des éléments d'une boucle SPIP. 
    let criteres = validate.mustBeJSON(req.params.criteres,res);//si non valide renvoi une erreur 400
    req.spip.select(req.params.boucle,criteres)
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
    
    

    let query = validate.mustBeJSON(req.params.criteres,res);//si non valide renvoi une erreur 400
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
    let criteres = validate.mustBeJSON(req.params.criteres,res);//si non valide renvoi une erreur 400
    
        req.spip.delete(req.params.boucle,criteres)
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

router.patch('(/:boucle'+validRoutes.route+'){1}s/:idList/ajouter/:ids',autorise(roles.ADMIN),function(req,res){
    console.log('boucles:',req.params.boucle,'/idList:',req.params.idList,'/ids:',req.params.ids);    

    let query = {};
    query['liens'] = validate.mustBeJSON(req.params.ids);      
    query["id"] = validate.mustBeJSONArray(req.params.idList);
    console.log("query:",query);
    req.spip.associer(req.params.boucle,query)
    .then((retour)=>{
        console.log("retour:",retour);
        res.json(
            {
                "status":"success",
                "data":retour,
            }
        )
    })
    .catch((e)=>res.status(500).json(
        {
            "status":"error",
            "message":e.message
        }
    ));

});

module.exports = router;