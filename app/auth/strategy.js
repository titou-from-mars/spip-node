const jwt = require('jsonwebtoken'),    
      passportJWT = require("passport-jwt"),
      ExtractJwt = passportJWT.ExtractJwt,
      JwtStrategy = passportJWT.Strategy;

var   jwtOptions = {};

module.exports = function(spip,secretOrKey){

    jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt');//simule comportement 2.x.x . Il faudra peut-être adopter  ExtractJwt.fromAuthHeaderAsBearerToken() de la 3.x.x
    jwtOptions.secretOrKey = secretOrKey;

    return new JwtStrategy(jwtOptions, function (jwt_payload, next) {
        //console.log('payload received', jwt_payload);    
        spip.auth(jwt_payload.id,jwt_payload.connectionID)
        .then((user)=>{
            //console.log("user:::",user);
            (user)? next(null, user) : next(null, false);
    
        })
        .catch((e)=>{
            console.log("Erreur dans la stratégie JWT",e);
            next(e, false);
        });    
    
    });

}