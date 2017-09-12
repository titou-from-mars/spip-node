const spip = require("../models/spip/spip.js");
module.exports = function(pool){
    //permet de s'assurer qu'il n'y a qu'une copie de la fonction, cf https://stackoverflow.com/questions/12737148/creating-a-expressjs-middleware-that-accepts-parameters
    return exports[pool] || function(req,res,next){
        req.spip = new spip(pool);
        next();
    }
}