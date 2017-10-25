const express = require('express'), 
      validate = require('./validate/valid-parameters.js'),
      validRoutes = require('./validate/valid-routes.js');  
      router = express.Router(),
      roles = require('../auth/roles');


/**
 * Renvoi les éléments de la boucle <boucle> répondant aux critères <criteres>
 * @example
 * //exemple d'objet criteres pour une sélection d'article
 * {
 *   criteres:{
 *      limit:50, // renvoi 50 résultats max (défaut 10)
 *      id_rubrique:6, //les éléments sont dans la rubrique 6
 *      id_auteur:4, // les éléments dont l'auteur correspond à l'id_auteur 4 (jointure automatique)
 *      id_mot: 12, // les éléments auquel le mot clef 12 a été associé (jointure automatique)
 *      plugrand:{date:"2016"}, //les élements dont la date est postérieures à 2016
 *      pluspetit:{date:"2017",id_article:256}, //les élements dont la date est antérieure à 2017  et l'id_article plus petit que 256     
 *   },
 *   balises:["id_article","titre","texte"] //renvoi l'id_article, le titre et le texte des articles correspondants aux critères de sélection
 * }
 * @param {string} boucle - Le nom d'une boucle au pluriel
 * @param {object} criteres - Un objet décrivant les critères de sélection - cf exemple
 */
router.get('(/:boucle'+validRoutes.route+'){1}s/:criteres',autorise(roles.PUBLIC),function(req,res){
    //recupère des éléments d'une boucle SPIP. 
    let query = validate.mustBeJSON(req.params.criteres,res);//si non valide renvoi une erreur 400
    query.connection = req.requete.connection;
    req.spip.select(req.params.boucle,query)
    .then((retour)=>{
        //console.log('retour',retour);
        res.json(
            {
                "status":"success",
                "data":retour
            });
    })
    .catch((e)=>res.status(500).json(
            {
                "status":"error",
                "message":e.message
            })
    );
});


router.patch('(/:boucle'+validRoutes.route+'){1}s/:criteres',autorise(roles.ADMIN),function(req,res){
    //met à jour des éléments
    
    

    let query = validate.mustBeJSON(req.params.criteres,res);//si non valide renvoi une erreur 400
    query['set'] = req.body;
    query['connection'] = req.requete.connection;
    
        req.spip.update(req.params.boucle,query)
        .then((retour)=>{
            //console.log('retour',retour);
            res.json(
                {
                    "status":"success",
                    "data":retour
                });
        })
        .catch((e)=>res.status(500).json(
                {
                    "status":"error",
                    "message":e.message
                })
        );
});

router.delete('(/:boucle'+validRoutes.route+'){1}s/:criteres',autorise(roles.WEBMESTRE),function(req,res){
    //supprime des éléments
    let query = validate.mustBeJSON(req.params.criteres,res);//si non valide renvoi une erreur 400
    query['connection'] = req.requete.connection;
    
        req.spip.delete(req.params.boucle,query)
        .then((retour)=>{
            //console.log('retour',retour);
            res.json(
                {
                    "status":"success",
                    "data":retour
                });
        })
        .catch((e)=>res.status(500).json(
                {
                    "status":"error",
                    "message":e.message
                })
        );
});

router.patch('(/:boucle'+validRoutes.route+'){1}s/:idList/ajouter/:ids',autorise(roles.ADMIN),function(req,res){
    console.log('boucles:',req.params.boucle,'/idList:',req.params.idList,'/ids:',req.params.ids);    

    let query = {};
    query['liens'] = validate.mustBeJSON(req.params.ids);      
    query["id"] = validate.mustBeJSONArray(req.params.idList);
    query['connection'] = req.requete.connection;
    console.log("query:",query);
    req.spip.associer(req.params.boucle,query)
    .then((retour)=>{
        console.log("retour:",retour);
        res.json(
            {
                "status":"success",
                "data":retour,
            }
        )
    })
    .catch((e)=>res.status(500).json(
        {
            "status":"error",
            "message":e.message
        }
    ));

});

module.exports = router;