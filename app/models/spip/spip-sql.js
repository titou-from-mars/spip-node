let mysql = require("mysql2");
module.exports = {
    ping :function (){
        console.log("pong");
    },

    select:function(query,callback){
        //console.log("SELECT");
        // console.log("query:\n",query);
        // console.log("this:",this);
         query.sql = "SELECT " + query.balises + " FROM  ??";
         query.sql = mysql.format(query.sql, [query.boucle.table]);
         callback(null,query);
     },

     /**
     * Formate en criteres pour une clause where les propriétés d'un objet où le nom des propriétés correspond au nom des colonnes
     * NOTES :
     * - La methode n'ajoute pas WHERE, il doit être ajouté par ailleur (pour permettre d'utiliser la méthode pour une partie de la clause)
     * - En l'état, il y a des risques d'erreurs pour ambiguité si la requête porte sur plusieurs tables et qu'il y a des champs homonymes entre ces tables
     * @param {object} criteres - Un objet dont chaque paires paramètre/valeur correspond à un critère pour la clause WHERE
     * 
     * @return {string} - une  portion de requête sql utilisable dans une clause WHERE
     */
     where:function (query,callback) {
        //console.log("WHERE");
        if (query.isJointure && query.criteres) query.sql += " AND ";  
        if (query.criteres === 1) query.sql +=  " 1 ";
        else{
            let first = true;        
            for (let crit in query.criteres) {
                (!first) ? query.sql += " AND ": first = false;
                query.sql += " " + mysql.escapeId(crit) + " = " + mysql.escape(query.criteres[crit]);
            }

        }
        
        callback(null,query);
    },

    groupby:function(query,callback){
        //console.log("GROUP BY");
        query.sql += " GROUP BY " + query.boucle.table + "." + query.boucle.id + " LIMIT " + query.limit;
        callback(null,query);

    },

    update:function(query,callback){
        //console.log("UPDATE");
        query.sql = mysql.format("UPDATE ?? ", [query.boucle.table]);
        callback(null,query);
    },
    
    set:function(query,callback){
        //console.log("SET");
        if(query.boucle.maj){
            if(query.set && !query.set.hasOwnProperty("maj") ) query.set['maj'] = 'NOW()';
            else if(!query.set) query.set = {maj:'NOW()'};
        }
        
        query.sql += mysql.format(" SET ? ", [query.set]); 
        callback(null,query);
    },

    lien:function(query,callback){
        if(query.liens){
           // console.log("make lien");
            query.sql = "";            
            for(let i =0, len = query.liens.length; i < len; i++){
                query.sql += mysql.format("INSERT INTO ?? SET ? ;",query.liens[i]);
            }
        }
        callback(null,query);        

    },

    insert:function(query, callback){
        //console.log("INSERT");
        query.sql = mysql.format("INSERT INTO ?? SET ?", [query.boucle.table, query.set]);
        callback(null,query);
    },
    
    /**
     * Génère les requêtes pour les jointures automatiques dans spip (mots-clefs ou auteur associés à un boucle SPIP)
     * @param {object} query - un objet query généré par la méthode parseQuery
     * 
     * @return {string} - une portion de code sql correspondant à la jointure
     */
     join:function (query,callback) {
        //console.log("JOIN");
        //on construit la requête
        if(query.isJointure) {    
            
            for (let i = 0, len = query.boucle_join.length; i < len; i++) {
                query.sql += " INNER JOIN " + query.boucle_join[i].table + " AS L" + i + " ON (L" + i + ".id_objet = " + query.boucle.table + "." + query.boucle.id + " AND L" + i + ".objet = '" + query.boucle.nom + "') ";
            }
    
            query.sql += " WHERE ";
            for (let i = 0, len = query.boucle_join.length; i < len; i++) {
                if (i > 0) query.sql += " AND ";
                query.sql += " L" + i + "." + query.boucle_join[i].id_name + " = " + mysql.escape(query.boucle_join[i].id_value);
            }
        }else{
            query.sql += " WHERE ";
        }
    
        callback(null,query);
    
    },

    delete:function(query,callback){
        //console.log("DELETE");
        query.sql = mysql.format("DELETE ?? FROM  ?? ",[query.boucle.table,query.boucle.table]) ;
        callback(null, query);

    }


}
