var express = require('express'), 
router = express.Router();


router.get('/:collection/:id',function(req,res){
    //recupère un élément d'une collection SPIP.
    res.send('récupère '+req.params.collection+" id "+req.params.id);
});

router.post('/:collection',function(req,res){
    //créé un nouvel élément
    res.send('créé un '+req.params.collection);
});

router.patch('/:collection/:id',function(req,res){
    //met à jour un élément
    res.send('met à jour '+req.params.collection+" id "+req.params.id);
});

router.delete('/:collection/:id',function(req,res){
    //supprime un élément
    res.send('supprime '+req.params.collection+" id "+req.params.id);
});

module.exports = router;