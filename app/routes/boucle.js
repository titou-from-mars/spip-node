const express = require('express'),
    router = express.Router(),   
    validRoutes = require('./validate/valid-routes.js'),
    validParams = require('./validate/valid-parameters.js'),
    definitions = require('../models/spip/boucles.js').definitions
    roles = require('../auth/roles');



console.log("routes pattern :",validRoutes.route);
// L'expression régulière permet de ne traiter que les cas ou :id est un nombre
// https://stackoverflow.com/questions/11258442/express-routes-parameter-conditions
router.get('/:boucle'+validRoutes.route+'/:id(\\d+)/',autorise(roles.PUBLIC),function(req,res){
    //recupère un élément d'une boucle SPIP.
    console.log("get /",req.params.boucle,'/',req.params.id);
    let id = {};
    let id_name = definitions[req.params.boucle].id;
    id[id_name] = req.params.id;
    req.spip.select(req.params.boucle,{criteres:id})
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

router.post('/:boucle'+validRoutes.route,autorise(roles.ADMIN),function(req,res){
    //créé un nouvel élément        

    req.spip.insert(req.params.boucle,req.body)
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

/**
 * Met à jour l'élément de la boucle :boucle, correspondant à l'id :id avec le json passé dans le body
 * @param {string} boucle - le nom de la boucle au singulier (aka article, rubrique, etc )
 * @param {integer} id    - l'id de l'élément
 * @param {json} RequestBodyParameters     - un json avec les champs à mettre à jour, sous forme de paire propriétés/valeurs correspondant aux champs à mettre à jours/nouvelles valeurs
 */
router.patch('/:boucle'+validRoutes.route+'/:id(\\d+)/',autorise(roles.ADMIN),function(req,res){
    //met à jour un élément    
    let query = {"set":req.body};    
    query['criteres']={}; 
    let id_name = definitions[req.params.boucle].id;
    query['criteres'][id_name] = req.params.id;
    req.spip.update(req.params.boucle,query)
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

router.delete('/:boucle'+validRoutes.route+'/:id(\\d+)/',autorise(roles.WEBMESTRE),function(req,res){
    //supprime un élément
    let query = {};
    query['criteres']={};        
    let id_name = definitions[req.params.boucle].id;
    query['criteres'][id_name] = req.params.id;    

    req.spip.delete(req.params.boucle,query)
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


/**
 * Ajoute à l'élement d'une boucle @boucle dont l'id @id est fourni en paramètre, un ou plusieurs mots-clef correspondant aux id @ids_mot
 * @example - PATCH /article/55/ajouter/{"id_mot":[22,5],"id_auteur":2}  //ajoute les mots-clefs 22 et 5, ainsi que l'auteur 2 à l'article 55 
 * @param {string} boucle - Le nom de la boucle (ex : article, rubrique...)
 * @param {int} id - L'id correspondant à l'élement ciblé
 * @param {json} ids_mot - Le ou les id des mots clefs à ajouter à l'élement  
 */
router.patch('/:boucle/:id(\\d+)/ajouter/:ids',autorise(roles.ADMIN),function(req,res){
    
    let query = {};
    query['liens'] = validParams.mustBeJSON(req.params.ids,res);
    query["id"] = req.params.id;
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

router.patch('/:boucle/:id(\\d+)/retirer/:ids',autorise(roles.ADMIN),function(req,res){
    
    let query = {};
    query['liens'] = validParams.mustBeJSON(req.params.ids,res);
    query["id"] = req.params.id;
    console.log("query:",query);
    req.spip.dissocier(req.params.boucle,query)
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