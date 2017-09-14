var express = require('express'), 
router = express.Router();

router.get('(/:collection){1}s/:criteres',function(req,res){
    console.log("réqcupère collections ",req.params.collection, "criteres",req.params.criteres);    
    //recupère des éléments d'une collection SPIP.
    let query;
    try{
        query = JSON.parse(req.params.criteres);
    }catch(e){
        res.status(400).json({
            "status":"error",
            "message":"Le parametre n'est pas un JSON valide"
        });
    }
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