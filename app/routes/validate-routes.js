module.exports = {
    mustBeJSON:function(obj,res){
        try{
            JSON.parse(obj);
        }catch(e){
            res.status(400).json({
                "status":"error",
                "message":"un parametre n'est pas un JSON valide"
            });
        }
    }
}