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
