const express = require('express'), 
      jwt = require('jsonwebtoken'), 
      router = express.Router(),
      secretOrKey = '49bdc75682b5c5c26abba5434bb2ed45';

router.post('/login',function(req,res){
    console.log("login");
    //console.trace(req);
    req.spip.login(req.body.name,req.body.password).then((logintry)=>{
        //console.log("logintry"+logintry);
        if (logintry.logged) {
            // from now on we'll identify the user by the id and the id is the only personalized value that goes into our token
            var payload = {
                id: logintry.user.id_auteur
            };
            var token = jwt.sign(payload, secretOrKey);
            res.json({
                message: "ok",
                token: token
            });
        } else {
            res.status(401).json({
                message: "login & passwords dont match"
            });
        }

    })
    .catch((e)=>console.log("ça plante :-( ",e));
});

router.post('/logout',function(req,res){
    //logout
});

module.exports = router;