
const path = '../../../config/'; 

let instance = null;

class Boucles{

    constructor(){
        if(!instance){
            console.log("new object Boucles");
            instance = this;                          
            this.definitionsRaw = require(path+'boucles-dist.json');
            this.definitions = this.compil(this.definitionsRaw);            
        }
        
        console.log("return instance");
        return instance;
    }

    compil(definitions){
        console.log("compil----------");

        for(let boucle in definitions){            
            //console.log(this.definitions[boucle].jointures);
            if(definitions[boucle].jointures){

                let id_boucle =  definitions[boucle].id;
                for(let join in definitions[boucle].jointures){
                    //this.definitions[boucle]
                    let boucle_join = definitions[boucle].jointures[join];                    
                    //console.log("join:"+join);
                    if(!definitions[boucle_join]['jointuresInverses']) definitions[boucle_join]['jointuresInverses'] = {};
                    definitions[boucle_join].jointuresInverses[id_boucle] = boucle;
                }
                
            }
        }

        //console.log(this.definitions);
        console.log("----------end compil");
        return definitions;

    }

    add(newBoucles){        
        for (let prop in newBoucles) {
            this.definitionsRaw[prop] = newBoucles[prop];
        }
        this.definitions = this.compil(this.definitionsRaw);
        return true;
    }

    /**
     * Renvoi le nom de l'id correspondant au nom de la boucle donné en paramètre
     * @param  {string} boucle - le nom d ela boucle (article, rubrique, etc) au singulier
     * @return {string} - le nom de l'id (id_article, id_rubrique,etc)
     */
    getId(boucle){
        return this.definitions[boucle].id;
    }

}

const boucles = new Boucles();
module.exports = boucles;

