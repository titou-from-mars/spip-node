const express = require('express'),
router = express.Router();
autorise = require('../auth/autorise.js');
roles = require('../auth/roles.js');

router.get('/recalcul', autorise(roles.ADMIN),function (req, res){
    req.spip.recalcul()
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
        es.status(404).json(
            {
                "status":"error",
                "message":e.message
            });
    });
});

router.get('/meta/recalcul',autorise(roles.ADMIN), function(req,res){
    req.spip.meta.recalcul()
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
        es.status(404).json(
            {
                "status":"error",
                "message":e.message
            });
    });
});
router.get('/meta/:meta',autorise(roles.ADMIN),function(req,res){
    req.spip.meta.get(req.params.meta)
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
    .catch((e)=>res.status(404).json(
        {
            "status":"error",
            "message":e.message
        }));
});

module.exports = router;