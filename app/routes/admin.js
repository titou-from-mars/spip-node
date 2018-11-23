const express = require('express'),
router = express.Router();
autorise = require('../auth/autorise.js');
roles = require('../models/spip/roles');

router.get('/recalcul', autorise(roles.ADMIN_RESTREINT),function (req, res){
    req.spip.recalcul(req.requete.connection)
    .then((retour)=>{
        if(retour){
            res.json(
                {
                    "status":"success",
                    "data":retour
                }
            )

        }

    })
    .catch((e)=>{
        es.status(500).json(
            {
                "status":"error",
                "message":e.message
            });
    });
});

router.get('/meta/recalcul',autorise(roles.ADMIN_RESTREINT), function(req,res){
    req.spip.meta.recalcul(req.requete.connection)
    .then((retour)=>{
        if(retour){
            res.json(
                {
                    "status":"success",
                    "data":retour
                }
            )

        }

    })
    .catch((e)=>{
        es.status(500).json(
            {
                "status":"error",
                "message":e.message
            });
    });
});

router.get('/meta/tout',autorise(roles.ADMIN_RESTREINT),function(req,res){
    req.spip.meta.getAll(req.requete.connection)
    .then(retour=>{
        res.json(
            {
                "status":"success",
                "data":retour
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
 * /:connection/admin/meta/:meta
 * @param meta  le nom de pla propriété meta dont on veut récupérer la valeur
 * @example : /cv/admin/meta/adresse_suivi
 * renverra l'adresse configurée pour recevoir les messages de suivi de l'activité éditoriale
 * (configuré dans Interactivité/Notifications/Envoi de mails automatique)
 * du site correspondant à la connection cv
 */
router.get('/meta/:meta',autorise(roles.ADMIN_RESTREINT),function(req,res){
    req.spip.meta.get(req.params.meta,req.requete.connection)
    .then((retour)=>{
        console.log("retour:",retour);
        (retour) ?
        res.json(
            {
                "status":"success",
                "data":retour
            }
        ) :
        res.status(404).json(
            {
                "status":"fail"
            }
        )

    })
    .catch((e)=>res.status(500).json(
        {
            "status":"error",
            "message":e.message
        }));
});

module.exports = router;
