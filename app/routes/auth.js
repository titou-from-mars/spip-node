const express = require('express'), 
      jwt = require('jsonwebtoken'), 
      router = express.Router();      

router.post('/login',function(req,res){
    console.log("login, connectionID",req.requete.connection);
    //console.trace(req);
    req.spip.login(req.body.name,req.body.password,req.requete.connection).then((logintry)=>{
        //console.log("logintry"+logintry);
        if (logintry.logged) {
            // from now on we'll identify the user by the id and the id is the only personalized value that goes into our token
            var payload = {
                id: logintry.user.id_auteur,
                connectionID:req.requete.connection
            };
            var token = jwt.sign(payload, res.app.get('secretOrKey'));
            res.json({
                status: "success",
                token:token,//retrocomp avec une version antérieure
                data:{"token": token,"connectionID":req.requete.connection,"auteur":logintry}
            });
        } else {
            res.status(401).json({
                status:"fail",
                data:{ "reason":"Il y a 1 erreur dans votre saisie, veuillez vérifier les informations."}
            });
        }

    })
    .catch((e)=>{
        console.log("ça plante :-( ",e);
        //on reste vague dans le message transmis
        res.status(500).json({
            "status":"error",
            "message":"Un problème est survenu lors de votre authentification"
        });
    });
});

router.post('/logout',function(req,res){
    //logout
});

module.exports = router;