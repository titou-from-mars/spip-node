var express = require('express'), 
router = express.Router();


router.get('/:collection(.*s$)/',function(req,res){
    console.log("collectionS");
    res.send("demande d'une collectionS");
    //recupère des éléments d'une collection SPIP.
});

router.patch('/:collection',function(req,res){
    //met à jour des éléments
});

router.delete('/:collection',function(req,res){
    //supprime des éléments
});

module.exports = router;