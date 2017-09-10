module.exports = {
    isEmpty: function (obj) {//renvoi true si un objet est vide
        if(Object.keys(obj).length === 0 && obj.constructor === Object) return true;
        else return false;
    },
    lowerAll:function(obj){//met un lowercase une chaine ou tous les elts d'un tableau
        if(typeof obj === "string") return obj.toLowerCase();
        else if(Array.isArray(obj)){
            for(let i = 0, len = obj.length; i < len; i++) obj[i] = obj[i].toLowerCase();
            return obj;
        }
    },
     /**
    * Gets called if a parameter is missing and the expression
    * specifying the default value is evaluated.
    */
    throwIfMissing:function() {
        throw new Error('Missing parameter');
    }

   
  };