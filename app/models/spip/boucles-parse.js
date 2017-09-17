var tools = require('../../helpers/utils.js');
var spip_boucles = require('./boucles.js').definitions;
module.exports = {
    init:function({
                    boucle = tools.throwIfMissing(),
                    balises = null,
                    liens = null,
                    id =null,
                    criteres = null,
                    set = null
                    },
                    callback){
        console.log("init");
        let query = {};
        let error = null;
        //On vérifie que la boucle existe
        if(!spip_boucles.hasOwnProperty(boucle)) {
            error = new Error(boucle+" n'existe pas");
            console.log("il n'y a pas de collection "+boucle);            
        }else{                  
            query.set = set;
            query.raw = {boucle:boucle, balises:balises,liens:liens, id:id, criteres:criteres,set:set };
            query.isJointure = false;
            
            query.isCount = false;
            query.isCrit = (query.raw.criteres && !tools.isEmpty(query.raw.criteres));
            
            query.boucle_join = null;        
            
            query.liens = null;    
            ///query.boucle = query.raw.boucle;        
            query.boucle = spip_boucles[query.raw.boucle];
        }
        callback(error,query);
    },
    limit:function(query,callback){
        console.log("limit");
        if (query.raw.criteres && query.raw.criteres.hasOwnProperty("limit")) {
            query.limit = query.raw.criteres.limit;
            delete query.raw.criteres.limit;
        } else {
            query.limit = "0,10"; //par defaut on affiche que 10 résultats max
        }
        callback(null,query);
    },

    balises:function(query,callback){
        console.log("balises");
        // si on on a précisé le critère count, il écrase tout autre indication sur les balises
        if (query.raw.criteres && query.raw.criteres.hasOwnProperty("count") && query.raw.criteres.count === true) {
            //console.log("balises count");
            query.isCount = true;
            query.balises = "COUNT(*)";
            delete query.raw.criteres.count;
        } else if (!query.raw.balises || tools.isEmpty(query.raw.balises) || query.raw.balises == "*") { //si on a pas précisé de balise on renvoi tout.         
            //console.log("balises is empty");
            //pour l'boucle auteur on sélectionne les champs pour éviter de renvoyer les champs comme le mot de passe...
            (query.raw.boucle == "auteur") ? query.balises = ["id_auteur", "nom", "bio", "nom_site", "url_site"]: query.balises = "*";
        } else { //sinon on formate les balises demandées        
           // console.log("balises is not empty");
            //query.balises = this.connection.format("??",[balises]);
            query.balises = query.raw.balises;
        }
        callback(null,query);
    },
    jointures:function(query,callback){
        console.log("jointures");
        /**
         * Les jointures automatique
         */
        if(query.isCrit && query.boucle.jointures){
            //console.log("jointure!!");
            Object.keys(query.boucle.jointures).forEach(
                (id_join)=>{
                    if(query.raw.criteres.hasOwnProperty(id_join)){
                        query.isJointure = true;
                        if(!query.boucle_join) query.boucle_join = []; 
                        //console.log(id+"!");
                        if (Array.isArray(query.raw.criteres[id_join])) { //pour chaque critère, un élément doit correspondre dans le tableau boucle_join
                            for (let i = 0, len = query.raw.criteres[id_join].length; i < len; i++) 
                                query.boucle_join.push({
                                    id_name: id_join,
                                    id_value:query.raw.criteres[id_join][i],
                                    table:spip_boucles[query.boucle.jointures[id_join]].table_jointures
                                });
                                
                        } else {                            
                            query.boucle_join.push({
                                id_name: id_join,
                                id_value:query.raw.criteres[id_join],
                                table:spip_boucles[query.boucle.jointures[id_join]].table_jointures
                            });
                        }
                        delete query.raw.criteres[id_join];
                    }
                }
            )
        }else if(query.isCrit && query.boucle.jointuresInverses){
            console.log("peut-être jointure inverse?");
            Object.keys(query.boucle.jointuresInverses).forEach(
                (id_join)=>{
                    console.log("on boucle à la recherche de jointure inverse");
                    if(query.raw.criteres.hasOwnProperty(id_join)){
                        console.log("jointure inverse");
                        query.isJointureInverse = true;
                        if(!query.boucle_join) query.boucle_join = []; 
                        //console.log(id+"!");
                        if (Array.isArray(query.raw.criteres[id_join])) { //pour chaque critère, un élément doit correspondre dans le tableau boucle_join
                            for (let i = 0, len = query.raw.criteres[id_join].length; i < len; i++) 
                                query.boucle_join.push({
                                    id_name: id_join,
                                    id_value:query.raw.criteres[id_join][i],
                                    table:query.boucle.table_jointures,
                                    boucle:query.boucle.jointuresInverses[id_join]
                                });
                                
                        } else {                            
                            query.boucle_join.push({
                                id_name: id_join,
                                id_value:query.raw.criteres[id_join],
                                table:query.boucle.table_jointures,
                                boucle:query.boucle.jointuresInverses[id_join]
                            });
                        }
                        delete query.raw.criteres[id_join];
                    }
                }
            )

        }

        callback(null,query);

    },

    criteres:function(query,callback){
        console.log("criteres");
        if (!query.raw.criteres || tools.isEmpty(query.raw.criteres)) query.raw.criteres = 1;
        query.criteres = query.raw.criteres;
        callback(null,query);
    },

    liens:function(query,callback){
        console.log("liens");
        if(query.raw.liens && query.raw.id){
            
             query.liens = [];
     
             Object.keys(query.raw.liens).forEach(
                 (id_join)=>{
                     if(Array.isArray(query.raw.liens[id_join])) {
                         for(let j = 0, len = query.raw.liens[id_join].length; j < len; j++){
                             
                             let insert_set = {objet:query.boucle.nom,id_objet:query.raw.id};
                             insert_set[id_join] = query.raw.liens[id_join][j];
                             query.liens.push([spip_boucles[query.boucle.jointures[id_join]].table_jointures,insert_set]);
                         }
                     }else{
                         
                         let insert_set = {objet:query.boucle.nom,id_objet:query.raw.id};
                         insert_set[id_join] = query.raw.liens[id_join];
                         query.liens.push([spip_boucles[query.boucle.jointures[id_join]].table_jointures,insert_set]);
                     }
     
                 }
             );           
     
         }
         callback(null,query);

    }


}