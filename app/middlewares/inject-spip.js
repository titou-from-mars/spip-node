module.exports = function(spip){
    //permet de s'assurer qu'il n'y a qu'une copie de la fonction, cf https://stackoverflow.com/questions/12737148/creating-a-expressjs-middleware-that-accepts-parameters
    return exports[spip] || function(req,res,next){
        req.spip = spip;
        next();
    }
}
