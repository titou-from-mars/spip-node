const boucles = require('../../models/spip/boucles');
let instance = null;
/**
 * Classe singleton avec deux propriétés :
 * @property {string} route - pattern regex express des routes valides correspondant à des boucles spip
 * @property {string} routes - pattern regex express des routes valides au pluriel correspondant à des boucles spip
 * 
 * @class ValidRoutes
 */
class ValidRoutes{
    constructor(){       
        if(!instance) {
            instance = this;
            this.route = "(", this.routes = "(";
            let first=true;
            for(let p in boucles){
                if(first) first = false;
                else{
                    this.route+="|";
                    this.routes+="|";
                } 
                this.route+=p;
                this.routes+=p+"s";            
            }
            this.route +=")";
            this.routes +=")"; 
        }
        return instance;
    }
    
}

module.exports = ValidRoutes;