let mysql = require("mysql2");
let debug = false;

module.exports = {
    ping :function (){
        console.log("pong");
    },

    select:function(query,callback){
        if(debug) console.log("SELECT");
        // console.log("query:\n",query);
        // console.log("this:",this);
         query.sql = "SELECT " + query.balises +(query.motsAssocies|| " ")+(query.urlsAssociees|| " ")+ " FROM  ??";
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
        if(debug) console.log("WHERE");  
        if ((query.isJointure && query.criteres) || (query.isJointureInverse && query.criteres)) query.sql += " AND ";
        else query.sql += " WHERE ";
        query.sql +=  _where(query.criteres) ;
        if(query.pluspetit) query.sql += _whereRange(query.pluspetit,"<");
        if(query.plusgrand) query.sql += _whereRange(query.plusgrand,">"); 
        callback(null,query);
    },   

    groupby:function(query,callback){
        if(debug) console.log("GROUP BY");
        if( query.boucle.id ) query.sql += " GROUP BY " + query.boucle.table + "." + query.boucle.id;        
        callback(null,query);

    },

    limit:function(query,callback){
        if(query.limit) query.sql += " LIMIT " + query.limit;
        callback(null,query);
    },

    orderby:function(query,callback){
        if(query.order) query.sql += _orderBy(query.order);
        callback(null,query);
    },

    update:function(query,callback){
        if(debug) console.log("UPDATE");
        query.sql = mysql.format("UPDATE ?? ", [query.boucle.table]);
        callback(null,query);
    },
    
    set:function(query,callback){
        if(debug) console.log("SET");
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

    delier:function(query,callback){
        if(query.liens){
            query.sql = "";
            for(let i =0, len = query.liens.length; i < len; i++){
                //query.sql += mysql.format("INSERT INTO ?? SET ? ;",query.liens[i]);
                query.sql += mysql.format("DELETE FROM  ?? WHERE ",query.liens[i][0]) + _where(query.liens[i][1]) + ";" ;
            }
        }
        callback(null,query);
    },

    insert:function(query, callback){
        if(debug) console.log("INSERT");
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
        if(debug) console.log("JOIN");
        //on construit la requête
        if(query.isJointure) {    
            
            for (let i = 0, len = query.boucle_join.length; i < len; i++) {
                query.sql += " INNER JOIN " + query.boucle_join[i].table + " AS L" + i + " ON (L" + i + ".id_objet = " + query.boucle.table + "." + query.boucle.id + " AND L" + i + ".objet = '" + query.boucle.nom + "') ";
            }
        }
        if(query.motsAssocies){
            query.sql += " LEFT JOIN spip_mots_liens AS LM1 ON (LM1.id_objet = " + query.boucle.table + "." + query.boucle.id + " AND LM1.objet = '" + query.boucle.nom + "') ";
            query.sql += " LEFT JOIN spip_mots ON (spip_mots.id_mot = LM1.id_mot) ";
        }
        
        if(query.urlsAssociees){
            query.sql += " LEFT JOIN spip_urls ON (spip_urls.id_objet = spip_articles.id_article AND spip_urls.type = '" + query.boucle.nom + "')";
        }
        
        if(query.isJointure) {   
            query.sql += " WHERE ";         
            for (let i = 0, len = query.boucle_join.length; i < len; i++) {
                if (i > 0) query.sql += " AND ";
                query.sql += " L" + i + "." + query.boucle_join[i].id_name + " = " + mysql.escape(query.boucle_join[i].id_value);
            }
        }
    
        callback(null,query);
    
    },

    joinInverse:function (query,callback) {
        if(debug) console.log("JOIN");
        //on construit la requête
        if(query.isJointureInverse) {    
            
            for (let i = 0, len = query.boucle_join.length; i < len; i++) {
                query.sql += " INNER JOIN " + query.boucle_join[i].table + " AS L" + i + " ON (L" + i + "."+ query.boucle.id +" = " + query.boucle.table + "." + query.boucle.id + " ) ";
            }
    
            query.sql += " WHERE ";
            for (let i = 0, len = query.boucle_join.length; i < len; i++) {
                if (i > 0) query.sql += " OR ";
                query.sql += " L" + i + ".id_objet = " + mysql.escape(query.boucle_join[i].id_value);
                query.sql += " AND L" + i + ".objet = '"    + query.boucle_join[i].boucle + "'";  
            }
        }
    
        callback(null,query);
    
    },

    delete:function(query,callback){
        if(debug) console.log("DELETE");
        query.sql = mysql.format("DELETE ?? FROM  ?? ",[query.boucle.table,query.boucle.table]) ;
        callback(null, query);

    }


}

/**
 * fonctions "privés"
 */

_where = function(criteres){
    let sql = "";  
    if (criteres === 1) sql +=  " 1 ";
    else{
        let first = true;        
        for (let crit in criteres) {
            (!first) ? sql += " AND ": first = false;
            sql += " " + mysql.escapeId(crit) + " = " + mysql.escape(criteres[crit]);
        }

    }
    return sql;
};

_whereRange = function (criteres,operateur=">"){
    let sql = "";         
    for (let crit in criteres) {        
        sql += " AND " + mysql.escapeId(crit) + " " + operateur + " " + mysql.escape(criteres[crit]);
    }
    return sql;
}

_orderBy = function(orders) {
    let sql = " ORDER BY ";  
    
    let first = true;        
    for (let crit in orders) {
        (!first) ? sql += " , ": first = false;
        sql += " " + mysql.escapeId(crit) + " " + _ordreCode(orders[crit]);
    }
    
    return sql;
}

//sanitization
_ordreCode = function (order){
    if(order === 'DESC') return 'DESC';
    else return 'ASC';
}