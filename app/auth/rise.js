const definitions = require('../models/spip/boucles.js');
module.exports = function (req,res,next){
    console.log("user",req.user);
    console.log("params from rise:",req.params);
    req.user['bonus'] = 0;
    if(req.user.rubriques){//admin restreint
        let criteres = {};
        criteres[definitions.getId(req.params.boucle)] = req.params.id;
        req.spip.select(req.params.boucle,{balises:["id_rubrique","statut"],criteres:criteres,connection:req.requete.connection})
        .then((result)=>{
            if(req.user.rubriques && (req.user.rubriques.indexOf(result[0].id_rubrique) > -1)) {
                console.log("bonus");
                req.user['bonus'] = 1;
            }else console.log("pas bonus");
            console.log("result:",result,"id_rubrique",result[0].id_rubrique);
            next();
        })
        .catch((e)=>{
            res.status(500).json({
                "status":"error",
                "message":e.message
            });
        });
    }else next();
}
