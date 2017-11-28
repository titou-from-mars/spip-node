const express = require('express'),
    router = express.Router(),   
    validRoutes = require('./validate/valid-routes.js'),
    validParams = require('./validate/valid-parameters.js'),
    definitions = require('../models/spip/boucles.js').definitions
    roles = require('../models/spip/roles');


console.log("routes pattern :",validRoutes.route);
/**
 * Renvoi l'élément de la boucle :boucle correspondant à l'id :id
 * 
 * @example
 * GET /article/5 //renvoi l'article correspondant à l'id_article 5
 * @example
 * 
 * @param {string} boucle - le nom de la boucle au singulier (aka article, rubrique, etc )
 * @param {integer} id    - l'id de l'élément
 */
// L'expression régulière permet de ne traiter que les cas ou :id est un nombre
// https://stackoverflow.com/questions/11258442/express-routes-parameter-conditions
router.get('/:boucle'+validRoutes.route+'/:id(\\d+)/',autorise(roles.PUBLIC),function(req,res){
    //recupère un élément d'une boucle SPIP.
    console.log("get /",req.params.boucle,'/',req.params.id);
    req.requete.criteres = {};
    let id_name = definitions[req.params.boucle].id;
    req.requete.criteres [id_name] = req.params.id;
    
    req.spip.select(req.params.boucle,req.requete)
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
    .catch((e)=> res.status(500).json(
        {
            "status":"error",
            "message":e.message
        }));
    
});

/**
 * Créé un nouvel élément de la boucle :boucle avec les valeurs du json passé dans le body
 * 
 * @example
 * POST /article
 * body:{"titre":"un nouvel article","texte","Lorem Ipsum..."}
 * //créé un nouvel article avec le titre et le texte passé dans le json du boby
 * @example
 * 
 * @param {string} boucle - le nom de la boucle au singulier (aka article, rubrique, etc )
 * @param {json} RequestBodyParameters  - un json sous forme de paire propriétés/valeurs correspondant aux valeurs des champs de l'éléments à créer
 */
router.post('/:boucle'+validRoutes.route,autorise(roles.ADMIN_RESTREINT),function(req,res){
    //créé un nouvel élément 
    req.requete.set =  req.body;    
    
    req.spip.insert(req.params.boucle,req.requete)
    .then((retour)=>{
        console.log('retour',retour);
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

/**
 * Met à jour l'élément de la boucle :boucle, correspondant à l'id :id avec le json passé dans le body
 * 
 * @example
 * PATCH /article/5 
 * body:{"titre":"mon nouveau titre","texte":"Lorem Ipsum..."}
 * //Met à jour le titre et le texte de l'article correspondant id_article 5
 * @example
 * 
 * @param {string} boucle - le nom de la boucle au singulier (aka article, rubrique, etc )
 * @param {integer} id    - l'id de l'élément
 * @param {json} RequestBodyParameters     - un json avec les champs à mettre à jour, sous forme de paire propriétés/valeurs correspondant aux champs à mettre à jours/nouvelles valeurs
 */
router.patch('/:boucle'+validRoutes.route+'/:id(\\d+)/',autorise(roles.ADMIN_RESTREINT),function(req,res){
    //met à jour un élément  
    req.requete.set = req.body; 
    req.requete.criteres = {};      
    let id_name = definitions[req.params.boucle].id;
    req.requete.criteres[id_name] = req.params.id;
    req.spip.update(req.params.boucle,req.requete)
    .then((retour)=>{
        console.log('retour',retour);
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

/**
 * Supprime (Efface de la base), l'élément de la boucle :boucle correspondant à l'id :id
 * 
 * @example
 * DELETE /article/5 //suprrime l'article correspondant à l'id_article 5
 * @example
 * 
 * @param {string} boucle - Le nom de la boucle (ex : article, rubrique...)
 * @param {int} id - L'id correspondant à l'élement ciblé
 */
router.delete('/:boucle'+validRoutes.route+'/:id(\\d+)/',autorise(roles.WEBMESTRE),function(req,res){
    //supprime un élément    
    
    req.requete['criteres']={};        
    let id_name = definitions[req.params.boucle].id;
    req.requete.criteres[id_name] = req.params.id;    

    req.spip.delete(req.params.boucle,req.requete)
    .then(retour =>{
        console.log('retour',retour);
        retour['affectedId'] = req.params.id;
        res.json(
            {
                "status":"success",
                "data":retour
            });
    })
    .catch(e=>res.status(500).json(
            {
                "status":"error",
                "message":e.message
            })
    );
});


/**
 * Ajoute à l'élement d'une boucle :boucle dont l'id :id est fourni en paramètre, un ou plusieurs éléments correspondant aux id :ids
 * @example 
 * PATCH /article/55/ajouter/{"id_mot":[22,5],"id_auteur":2}  //ajoute les mots-clefs 22 et 5, ainsi que l'auteur 2 à l'article 55
 * @example
 * 
 * @param {string} boucle - Le nom de la boucle (ex : article, rubrique...)
 * @param {int} id - L'id correspondant à l'élement ciblé
 * @param {json} ids - Le ou les id des éléments à ajouter à l'élement cible 
 */
router.patch('/:boucle/:id(\\d+)/ajouter/:ids',autorise(roles.ADMIN),function(req,res){
    
    req.requete['liens'] = validParams.mustBeJSON(req.params.ids,res);
    req.requete["id"] = req.params.id;
    console.log("query:",req.requete);
    req.spip.associer(req.params.boucle,req.requete)
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

/**
 * Retire à l'élement d'une boucle :boucle dont l'id :id est fourni en paramètre, un ou plusieurs éléments correspondant aux id :ids
 * @example 
 * PATCH /article/55/retirer/{"id_mot":[22,5],"id_auteur":2}  //retire les mots-clefs 22 et 5, ainsi que l'auteur 2 de l'article 55 
 * @example
 * 
 * @param {string} boucle - Le nom de la boucle (ex : article, rubrique...)
 * @param {int} id - L'id correspondant à l'élement ciblé
 * @param {json} ids - Le ou les id des éléments à associer à l'élement cible : {"id_mot":[2,5],"id_auteur":4}
 */
router.patch('/:boucle/:id(\\d+)/retirer/:ids',autorise(roles.ADMIN),function(req,res){
    
    req.requete['liens'] = validParams.mustBeJSON(req.params.ids,res);
    req.requete["id"] = req.params.id;
    console.log("query:",req.requete);
    req.spip.dissocier(req.params.boucle,req.requete)
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