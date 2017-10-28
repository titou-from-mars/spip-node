const tools = require('../../helpers/utils.js');
const spip_boucles = require('./boucles.js').definitions;
const debug =false;
module.exports = {
    init:function({
                    boucle = tools.throwIfMissing(),
                    balises = null,
                    liens = null,
                    id =null,
                    criteres = null,
                    set = null,
                    order = null,
                    connection = tools.throwIfMissing()
                    },
                    callback){
        if(debug) console.log("init");
        let query = {};
        let error = null;
        //On vérifie que la boucle existe
        if(!spip_boucles.hasOwnProperty(boucle)) {
            error = new Error(boucle+" n'existe pas");
            if(debug) console.log("il n'y a pas de collection "+boucle);            
        }else{                  
            query.set = set;
            query.raw = {boucle:boucle, balises:balises,liens:liens, id:id, criteres:criteres,set:set };
            query.isJointure = false;
            query.connection = connection;
            
            query.isCount = false;
            query.isCrit = (query.raw.criteres && !tools.isEmpty(query.raw.criteres));
            
            query.boucle_join = null;        
            
            query.liens = null;    
            ///query.boucle = query.raw.boucle;        
            query.boucle = spip_boucles[query.raw.boucle];
            query.order = order;
        }
        callback(error,query);
    },    
    limit:function(query,callback){
        if(debug) console.log("limit");
        if (query.raw.criteres && query.raw.criteres.hasOwnProperty("limit")) {
            query.limit = query.raw.criteres.limit;
            delete query.raw.criteres.limit;
        } else {
            query.limit = "0,10"; //par defaut on affiche que 10 résultats max
        }
        callback(null,query);
    },

    balises:function(query,callback){
        if(debug) console.log("balises");
        // si on on a précisé le critère count, il écrase tout autre indication sur les balises
        if (query.raw.criteres && query.raw.criteres.hasOwnProperty("count") && query.raw.criteres.count === true) {
            //console.log("balises count");
            query.isCount = true;
            query.balises = "COUNT(*)";
            delete query.raw.criteres.count;
        } else if (!query.raw.balises || tools.isEmpty(query.raw.balises) || query.raw.balises == "*") { //si on a pas précisé de balise on renvoi tout.         
            //console.log("balises is empty");
            //pour l'boucle auteur on sélectionne les champs pour éviter de renvoyer les champs comme le mot de passe...
            (query.raw.boucle == "auteur") ? query.balises = ["spip_auteurs.id_auteur", "spip_auteurs.nom", "spip_auteurs.bio", "spip_auteurs.nom_site", "spip_auteurs.url_site"]: query.balises = "*";
        } else { //sinon on formate les balises demandées        
           // console.log("balises is not empty");
            //query.balises = this.connection.format("??",[balises]);
            query.motsAssocies = null;
            if(query.boucle.jointures && query.boucle.jointures.id_mot){
                if(Array.isArray(query.raw.balises)){
                    let mots = query.raw.balises.indexOf('mots');
                    if(mots > -1) {
                        console.log("on demande les mots-clefs associés !");
                        query.motsAssocies = ", CONCAT('[',GROUP_CONCAT(DISTINCT CONCAT('{\"id_mot\":',spip_mots.id_mot,',\"titre\":\"',spip_mots.titre,'\"}')),']') AS mots ";

                        query.raw.balises.splice(mots,1);
                    }
                }              
            }
            query.urlsAssociees = null;
            if(query.boucle.url && Array.isArray(query.raw.balises)){
                let urls = query.raw.balises.indexOf('urls');
                if(urls > -1){
                    console.log("on demande les urls associés !");
                    query.urlsAssociees = ", CONCAT('[',GROUP_CONCAT(DISTINCT CONCAT('{\"url\":',spip_urls.url,',\"id_parent\":\"',spip_urls.id_parent,'\"}')),']') AS urls ";
                    
                    query.raw.balises.splice(urls,1);
                }

            }
            
            //on "désambigue" les balises
            query.balises = _desambigue(query.raw.balises,query.boucle.table);
            /*if(Array.isArray(query.raw.balises)){
                query.balises = [];
                for(let i = 0, len = query.raw.balises.length; i < len ; i++) {
                    if(debug) console.log("boucle : ",query.raw.balises[i]);
                    query.balises.push(query.boucle.table+'.'+query.raw.balises[i]);
                }

            }else{
                query.balises = query.boucle.table+'.'+query.raw.balises;
            }*/
            
        }
        callback(null,query);
    },
    jointures:function(query,callback){
        if(debug) console.log("jointures");
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
            if(debug) console.log("peut-être jointure inverse?");
            Object.keys(query.boucle.jointuresInverses).forEach(
                (id_join)=>{
                    if(debug) console.log("on boucle à la recherche de jointure inverse");
                    if(query.raw.criteres.hasOwnProperty(id_join)){
                        if(debug) console.log("jointure inverse");
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
        if(debug) console.log("criteres");
        
        if(query.raw.criteres && query.raw.criteres.hasOwnProperty("pluspetit")){

            query.pluspetit = _desambigue(query.raw.criteres.pluspetit, query.boucle.table);
            delete query.raw.criteres.pluspetit;
        }
        if(query.raw.criteres && query.raw.criteres.hasOwnProperty("plusgrand")){
            query.plusgrand = _desambigue(query.raw.criteres.plusgrand,query.boucle.table);
            delete query.raw.criteres.plusgrand;
        }
        if (!query.raw.criteres || tools.isEmpty(query.raw.criteres)) query.raw.criteres = 1;
        else query.raw.criteres = _desambigue(query.raw.criteres,query.boucle.table);
        
        query.criteres = query.raw.criteres;
        callback(null,query);
    },

    liens:function(query,callback){
        if(debug) console.log("liens");
        if(query.raw.liens && query.raw.id){
            
             query.liens = [];
     
             Object.keys(query.raw.liens).forEach(                 
                 (id_join)=>{
                    if(Array.isArray(query.raw.id)){//Plusieurs élements sur lequel associer des objets
                        for(let i = 0, l = query.raw.id.length ; i < l ; i++){
                            if(Array.isArray(query.raw.liens[id_join])) {//plusieurs objet à associer
                                for(let j = 0, len = query.raw.liens[id_join].length; j < len; j++) 
                                   query.liens.push(_makeInsertSetForLiens(query,{id_objet:query.raw.id[i],id_join_name:id_join,id_join_value:query.raw.liens[id_join][j]}));
                                
                            } else query.liens.push(_makeInsertSetForLiens(query,{id_objet:query.raw.id[i],id_join_name:id_join,id_join_value:query.raw.liens[id_join]}));

                        }

                    }else{
                        if(Array.isArray(query.raw.liens[id_join])) {//plusieurs objet à associer
                            for(let j = 0, len = query.raw.liens[id_join].length; j < len; j++) 
                               query.liens.push(_makeInsertSetForLiens(query,{id_objet:query.raw.id,id_join_name:id_join,id_join_value:query.raw.liens[id_join][j]}));
                            
                        } else query.liens.push(_makeInsertSetForLiens(query,{id_objet:query.raw.id,id_join_name:id_join,id_join_value:query.raw.liens[id_join]}));

                    }
                     
     
                 }
             );           
     
         }
         callback(null,query);

    }


}

function _makeInsertSetForLiens(query,{id_objet,id_join_name,id_join_value}){
    let insert_set = {objet:query.boucle.nom,id_objet:id_objet};
    insert_set[id_join_name] = id_join_value;
    return [spip_boucles[query.boucle.jointures[id_join_name]].table_jointures,insert_set];
}

function _desambigue(cols,table){
    //on "désambigue" les balises
    let _cols;    
    if(Array.isArray(cols)){
        _cols = [];        
        for(let i = 0, len = cols.length; i < len ; i++) {            
            _cols.push(table+'.'+cols[i]);
        }
    }else if( (typeof cols === "object") && (cols !== null) ){
        _cols = {};        
        for(let col in cols){
            _cols[table+'.'+col] = cols[col];
        }

    }else _cols = table+'.'+cols;          
    
    return _cols;
}