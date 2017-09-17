const express = require('express'),
router = express.Router();
ValidRoutes = require('./validate/valid-routes.js');
validParams = require('./validate/valid-parameters.js');

const validRoutes = new ValidRoutes();

console.log("routes pattern :",validRoutes.route);
// L'expression régulière permet de ne traiter que les cas ou :id est un nombre
// https://stackoverflow.com/questions/11258442/express-routes-parameter-conditions
router.get('(/:collection'+validRoutes.route+'){1}s/mot/:id_mot(\\d+)/',function(req,res){
//router.get('/:collection'+validRoutes.route+'/mot/:id_mot(\\d+)/',function(req,res){
    //recupère les éléments élément d'une collection SPIP.
    console.log("hello !");

    res.redirect('/'+req.params.collection+'s/{"criteres":{"id_mot":'+req.params.id_mot+'}}');


});
module.exports = router;