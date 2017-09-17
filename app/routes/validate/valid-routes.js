const boucles = require('../../models/spip/boucles');
let instance = null;
/**
 * Classe singleton pour générer des pattern compatible express, définissant des routes valides, en fonction de la classe boucle de la lib Spip.
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
            for(let p in boucles.definitions){
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