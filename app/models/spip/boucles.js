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

            this.compil();
            
        }
        console.log("return instance");
        return instance;
    }

    compil(){
        console.log("compil----------");

        for(let boucle in this.definitions){            
            //console.log(this.definitions[boucle].jointures);
            if(this.definitions[boucle].jointures){

                let id_boucle =  this.definitions[boucle].id;
                for(let join in this.definitions[boucle].jointures){
                    //this.definitions[boucle]
                    let boucle_join = this.definitions[boucle].jointures[join];                    
                    //console.log("join:"+join);
                    if(!this.definitions[boucle_join]['jointuresInverses']) this.definitions[boucle_join]['jointuresInverses'] = {};
                    this.definitions[boucle_join].jointuresInverses[id_boucle] = boucle;
                }
                
            }
        }

        //console.log(this.definitions);
        console.log("----------end compil");

    }

}

const boucles = new Boucles();
module.exports = boucles;

