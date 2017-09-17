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
            
        }else{
            console.log("on renvoit le même object Boucles");
            return instance;
        }
    }

}

const boucles = new Boucles();
module.exports = boucles;

