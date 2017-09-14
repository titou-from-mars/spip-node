const express = require('express'), 
      validate = require('./validate-routes.js'),  
      router = express.Router();

router.get('(/:collection){1}s/:criteres',function(req,res){
    //recupère des éléments d'une collection SPIP.       
    
    validate.mustBeJSON(req.params.criteres,res);//si non valide renvoi une erreur 400

    req.spip.select(req.params.collection,JSON.parse(req.params.criteres))
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


router.patch('/:collection',function(req,res){
    //met à jour des éléments
});

router.delete('/:collection',function(req,res){
    //supprime des éléments
});

module.exports = router;