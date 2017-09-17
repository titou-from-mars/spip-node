//Syntactic sugar

const express = require('express'),
router = express.Router();
boucles = require('../models/spip/boucles.js');
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
 * récupère les élemnents liés au mot-clefà l'auteur dont l'id est donnés en parametres
 */
router.get('(/:collection'+validRoutes.route+'){1}s/auteur/:id_auteur(\\d+)/',function(req,res){     
    res.redirect('/'+req.params.collection+'s/{"criteres":{"id_auteur":'+req.params.id_auteur+'}}');
});

module.exports = router;