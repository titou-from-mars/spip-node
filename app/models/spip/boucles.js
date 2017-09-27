const fs = require('fs');
const path = '../../../config/'; 

let instance = null;

class Boucles{

    constructor(){
        if(!instance){
            console.log("new object Boucles");
            instance = this;
            if(fs.existsSync(path+'boucles.json')){   //on peut surcharger la définition par défaut pour ajouter ses propres boucles             
                this.definitions = require(path+'boucles.json');
            }else{                
                this.definitions = require(path+'boucles-dist.json');
            }

            this.definitions = this.compil(this.definitions);
            
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

}

const boucles = new Boucles();
module.exports = boucles;

