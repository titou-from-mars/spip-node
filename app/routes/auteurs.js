var express = require('express'), 
router = express.Router();

/**
 * Les auteurs répondent ne sont pas traité comme un collection comme les autres.
 */

/*router.get('/auteur/:id',function(req,res){
    //recupère un auteur
});*/

router.get('/auteurs', function(req,res){
    //récupère une sélection d'auteurs
});

router.post('/auteur',function(req,res){
    //créé un nouvel auteur
});

router.patch('/auteur/:id',function(req,res){
    //met à jour un auteur
});

router.delete('/auteur/:id',function(req,res){
    //supprime un auteur
});

module.exports = router;