//Syntactic sugar

const express = require('express'),
router = express.Router();
ValidRoutes = require('./validate/valid-routes.js');
validParams = require('./validate/valid-parameters.js');

const validRoutes = new ValidRoutes();

/**
 * récupère les élemnents liés au mot-clef dont l'id est donnés en parametres
 */
router.get('(/:collection'+validRoutes.route+'){1}s/mot/:id_mot(\\d+)/',function(req,res){     
    res.redirect('/'+req.params.collection+'s/{"criteres":{"id_mot":'+req.params.id_mot+'}}');
});

/**
 * Récupère les mots-clefs liés à l'élément dont l'id et la collection sont donnés en paramètre
 */
router.get('/mots/:collection'+validRoutes.route+'/:id(\\d+)/',function(req,res){
    console.log("json",'/mots/{"criteres":{"id_'+req.params.collection+'":'+req.params.id+'}}')
    res.redirect('/mots/{"criteres":{"id_'+req.params.collection+'":'+req.params.id+'}}');
});




/**
 * récupère les élemnents liés au mot-clef à l'auteur dont l'id est donnés en parametres
 */
router.get('(/:collection'+validRoutes.route+'){1}s/auteur/:id_auteur(\\d+)/',function(req,res){     
    res.redirect('/'+req.params.collection+'s/{"criteres":{"id_auteur":'+req.params.id_auteur+'}}');
});

/**
 * Récupère les auteurs liés à l'élément dont l'id et la collection sont donnés en paramètre
 */
router.get('/auteurs/:collection'+validRoutes.route+'/:id(\\d+)/',function(req,res){
    res.redirect('/auteurs/{"criteres":{"id_'+req.params.collection+'":'+req.params.id+'}}');
});

module.exports = router;