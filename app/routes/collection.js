var express = require('express'),
    router = express.Router();

router.get('/:collection/:id',function(req,res){
    //recupère un élément d'une collection SPIP.
    console.log("get /",req.params.collection,'/',req.params.id);
    let id = {};
    id["id_"+req.params.collection] = req.params.id;
    req.spip.select(req.params.collection,{criteres:id})
    .then((retour)=>{
        (retour.length)? res.send(retour) : res.status(404).send();        
    })
    .catch((e)=> res.status(500).send('Une erreur est survenue :-('));
    
});

router.post('/:collection',function(req,res){
    //créé un nouvel élément    
    res.send('créé un '+req.params.collection);
});

router.patch('/:collection/:id',function(req,res){
    //met à jour un élément    
    let query = req.body;    
    query['criteres']={};    
    query['criteres']['id_'+req.params.collection] = req.params.id;    

    req.spip.update(req.params.collection,query)
    .then((retour)=>{
        console.log('retour',retour);
        res.send(retour);
    })
    .catch((e)=>console.log("Erreur ",e));
});

router.delete('/:collection/:id',function(req,res){
    //supprime un élément
    res.send('supprime '+req.params.collection+" id "+req.params.id);
});

module.exports = router;