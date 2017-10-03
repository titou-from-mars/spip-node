module.exports = {
    mustBeJSON:function(obj,res){
        try{
            JSON.parse(obj);
        }catch(e){
            this.reject("un parametre n'est pas un JSON valide",res);            
        }
    },
    mustBeJSONArray:function(obj,res){
        try{
            let json = JSON.parse(obj);
            if(!Array.isArray(json)) this.reject("un paramètre n'est pas un Array JSOn valide",res);
        }catch(e){
            this.reject("un parametre n'est pas un JSON valide",res);            
        }

    },

    mustBeInteger:function(obj,res){
        if(!Number.isInteger(obj)) this.reject("un parametre n'est pas un entier valide",res);           
    },

    reject:function(message,res){
        res.status(400).json({
            "status":"error",
            "message":message
        });
    }

}