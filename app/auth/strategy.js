const jwt = require('jsonwebtoken'),    
      passportJWT = require("passport-jwt"),
      ExtractJwt = passportJWT.ExtractJwt,
      JwtStrategy = passportJWT.Strategy;

var jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt');//simule comportement 2.x.x . Il faudra peut-être adopter  ExtractJwt.fromAuthHeaderAsBearerToken() de la 3.x.x
jwtOptions.secretOrKey = require('../../config/security.json').secretOrKey; 

module.exports = function(spip){
    return new JwtStrategy(jwtOptions, function (jwt_payload, next) {
        //console.log('payload received', jwt_payload);    
        spip.select('auteur',{balises:"id_auteur",criteres:{id_auteur:jwt_payload.id}})
        .then((user)=>{
            (user.length)? next(null, user) : next(null, false);
    
        })
        .catch((e)=>{
            console.log("Erreur dans la stratégie JWT",e);
            next(e, false);
        });    
    
    });

}