var express = require('express'),
    router = express.Router();

router.get('/:collection/:id',function(req,res){
    //recupère un élément d'une collection SPIP.
    console.log("get /",req.params.collection,'/',req.params.id);
    let id = {};
    id["id_"+req.params.collection] = req.params.id;
    req.spip.select(req.params.collection,{criteres:id})
    .then((retour)=>{
        (retour.length)? res.json(
            {
                "status":"success",
                "data":retour
            }
        ) : res.status(404).json({
                "status":"fail",
                "data":null
        });        
    })
    .catch((e)=> res.status(404).json(
        {
            "status":"error",
            "message":e.message
        }));
    
});

router.post('/:collection',function(req,res){
    //créé un nouvel élément        

    req.spip.insert(req.params.collection,req.body)
    .then((retour)=>{
        console.log('retour',retour);
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

router.patch('/:collection/:id',function(req,res){
    //met à jour un élément    
    let query = req.body;    
    query['criteres']={};    
    query['criteres']['id_'+req.params.collection] = req.params.id;    

    req.spip.update(req.params.collection,query)
    .then((retour)=>{
        console.log('retour',retour);
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

router.delete('/:collection/:id',function(req,res){
    //supprime un élément
    let query = {};
    query['criteres']={};    
    query['criteres']['id_'+req.params.collection] = req.params.id;     

    req.spip.delete(req.params.collection,query)
    .then((retour)=>{
        console.log('retour',retour);
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