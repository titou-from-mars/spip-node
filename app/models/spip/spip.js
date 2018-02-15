// pour coloriser les message des console.log()
var pipe = require('async-waterfall');
var tools = require('../../helpers/utils.js');
var mysqlClient = require("./mysql-client.js");
var Meta = require("./meta.js");
var spip_boucles = require('./boucles.js').definitions;
var format = require("./sql-formatter.js");
var parse = require("./parameters-parser.js");
const mysql = require('mysql2');
const createHash = require("sha.js");
const roles = require('./roles');



function Spip(pool) {
    this.pool = pool;
    this.spipquery = new mysqlClient(this.pool);
    this.champsInterdits = ["htpass", "pass", "low_sec"];
    this.meta = new Meta(this.spipquery);
    this.auteursCache = [];
}


Spip.prototype.recalcul = function(connection){
    this.auteursCache = [];
    return this.meta.recalcul(connection);
}
Spip.prototype.auth = function(id_auteur,connection){
    if(this.auteursCache[id_auteur]){
        console.log("user from auteursCache");
        return Promise.resolve(this.auteursCache[id_auteur]);
    }else{
        //let query = "SELECT a.id_auteur, a.statut, a.webmestre FROM spip_auteurs a WHERE a.id_auteur = "+id_auteur;
        let query = "SELECT a.id_auteur, a.bio, a.nom, a.login, a.pass, a.alea_actuel, a.email, a.statut, a.webmestre, a.pgp";
        query += ",GROUP_CONCAT(r.id_rubrique) rubriques ";
        query += "FROM spip_auteurs a ";
        query += "LEFT JOIN spip_auteurs_liens L0 ON a.id_auteur = L0.id_auteur ";
        query += "LEFT JOIN spip_rubriques r ON L0.id_objet = r.id_rubrique AND L0.objet = 'rubrique' ";
        query += "WHERE a.id_auteur = "+id_auteur;
        query += " GROUP BY a.id_auteur ;";
        //console.log("query:",query);
        return this.spipquery.query(query,connection)
        .then((user)=>{
            user = user[0];
            if(user.rubriques){
                user.rubriques = user.rubriques.split(',');
                user.rubriques.forEach((elt,index)=> {
                    user.rubriques[index] = Number.parseInt(elt);
                });
            }

            if(user.webmestre === 'oui') user.role = roles.WEBMESTRE;
            else if(user.rubriques) user.role = roles.ADMIN_RESTREINT;//admin restreint
            else{
                switch(user.statut){
                    case "0minirezo": user.role = roles.ADMIN; break;
                    case "1comite": user.role = roles.REDACTEUR; break;
                    case "6forum"   : user.role = roles.VISITEUR; break;
                    default: user.role = roles.PUBLIC;
                }
            }
            this.auteursCache[id_auteur] = user;
            return user;

        })
        .catch((e)=>{
            return e;
        });

    }


}

Spip.prototype.login = function(login,pwd,connection){
    return new Promise( (resolve,reject)=>{
        //let query = "SELECT * FROM `spip_auteurs` WHERE `login`= " + mysql.escape(login)+" AND `statut` != '5poubelle';";
        let query = "SELECT a.id_auteur, a.bio, a.nom, a.login, a.pass, a.alea_actuel, a.email, a.statut, a.webmestre, a.pgp";
        query += ",GROUP_CONCAT(CONCAT('{\"id_rubrique\":', r.id_rubrique, ',\"id_secteur\":', r.id_secteur,',\"titre\":\"',r.titre,'\"}')) rubriques ";
        query += "FROM spip_auteurs a ";
        query += "LEFT JOIN spip_auteurs_liens L0 ON a.id_auteur = L0.id_auteur ";
        query += "LEFT JOIN spip_rubriques r ON L0.id_objet = r.id_rubrique AND L0.objet = 'rubrique' ";
        query += "WHERE a.login = "+mysql.escape(login);
        query += " GROUP BY a.id_auteur ;";
        this.spipquery.query(query,connection)
        .then((rows)=>{
            let user, sha256, hash,message;
            let logged = false;
            let retour = {};
            let login_exist = rows.length > 0;

            if(login_exist){
                user = rows[0];
                console.log("login exist");
                sha256 = createHash('sha256');
                hash = sha256.update(user['alea_actuel']+pwd, 'utf8').digest('hex');
                if(hash === user['pass']) logged = true;
                delete user.pass;
                delete user.alea_actuel;
                if(user.rubriques) user.rubriques = JSON.parse("["+user.rubriques+"]");
            }else{
                console.log("le login n'existe pas !");
            }

            if(logged){
                console.log("on retourne le user");
                resolve( {logged:logged,user:user});
            }else{
                console.log("on retourne un user vide");
                resolve( {logged:logged,user:{}});
            }

        })
        .catch((e)=>{
            console.log("Erreur dans le processus de login",e);
            reject(e);
        })
    });



}



/**
 * Lie un ou des éléments d'une boucle à un autre éléments. Typiquement associer un mot-clef à un article
 *
 * @example
 * // associe le mot-clef correpondant à l'id_mot 24 à l'article correspondant à l'id_article 589
 * Spip.associer("article",{liens:{id_mot:24},id:589})
 * @example
 *
 * @param {string} boucle - nom de la boucle SPIP
 * @param {object} queryParam - parametres de la requête
 * @param {object} queryParam.liens - un objet dont les propriétés correspondent aux id des objets à lier à l'élément SPIP
 * @param {number} queryParam.id - L'id de l'élément SPIP que l'on doit lier
 *
 * @return
 */
Spip.prototype.associer = function(boucle=throwIfMissing(),{liens = throwIfMissing(), id = throwIfMissing(), connection = throwIfMissing() }){

    return new Promise((resolve, reject) =>{
        pipe(
            [
                (callback)=>parse.init({boucle:boucle,liens:liens,id:id,connection:connection},callback),
                parse.liens,
                format.lien,
                this.sendQuery.bind(this)
            ],
            function(err,result){
                if(err) reject(err);
                else resolve(result);
            }
        );

    });
}


 Spip.prototype.dissocier = function(boucle=throwIfMissing(),{liens = throwIfMissing(), id = throwIfMissing(), connection = throwIfMissing() }){

    return new Promise((resolve, reject) =>{
        pipe(
            [
                (callback)=>parse.init({boucle:boucle,liens:liens,id:id,connection:connection},callback),
                parse.liens,
                format.delier,
                this.sendQuery.bind(this)
            ],
            function(err,result){
                if(err) reject(err);
                else resolve(result);
            }
            );
    });
 }


/**
 * Effectue une requête de type DELETE sur une table d'boucle SPIP. Cette requête supprime l'élément. Pour le mettre "à la poubelle",
 * il faut utiliser update pour mettre le statut à poubelle. La requête ne nettoie pas les tables de jointures.
 * @param  {string} boucle - L'boucle SPIP concerné (au **singulier**)
 * @param  {object} criteres - Un objet dont les couples propriétés/valeurs correspondent aux critères de sélection. Criteres est rendu obligatoire sur cette méthode pour éviter les catastrophes où toute une table est vidée
 *
 * @return {object} - Le résultat de la requête sql
 */
Spip.prototype.delete = function(boucle = throwIfMissing() ,{criteres = throwIfMissing(), connection = throwIfMissing()}){

    return new Promise((resolve, reject) =>{
        pipe(
            [
                (callback)=>parse.init({boucle:boucle,criteres:criteres,connection:connection},callback),
                parse.jointures,
                parse.criteres,
                format.delete,
                format.join,
                format.where,
                this.sendQuery.bind(this)
            ],
            function(err,result){
                if(err) reject(err);
                else resolve(result);
            }
        );

    });

}

/**
 * Effectue une requête de type INSERT sur une table d'boucle SPIP
 * @param  {string} boucle - La boucle SPIP concerné (au **singulier**)
 * @param  {object} set - Un objet dont les couples propriété/valeurs correspondent aux données à insérer
 *
 * @return {object} - Le résultat de la requête sql
 */
Spip.prototype.insert = function (boucle = throwIfMissing(), {set=throwIfMissing(), connection = throwIfMissing()}) {

    return new Promise((resolve, reject) =>{
        pipe(
            [
                (callback)=>parse.init({boucle:boucle, set:set,connection:connection},callback),
                format.insert,
                this.sendQuery.bind(this)
            ],
            function(err,result){
                if(err) reject(err);
                else resolve(result);
            }
        );

    });

}


/**
 * Effectue une requête de type UPDATE sur une table d'boucle SPIP
 * @param  {string} boucle - L'boucle SPIP concerné (au **singulier**)
 * @param  {object} set - Un objet dont les couples propriétés/valeurs correspondent aux champs à mettre à jour
 * @param  {object} criteres - Un objet dont les couples propriétés/valeurs correspondent aux critères de sélection
 *
 * @return {object} - Le résultat de la requête sql
 */
Spip.prototype.update = function (boucle = throwIfMissing(), {set = null, criteres=null, connection = throwIfMissing()}={}) {

    return new Promise((resolve, reject) =>{
        pipe(
            [
                (callback)=>parse.init({boucle:boucle, criteres:criteres,set:set,connection:connection},callback),
                parse.jointures,
                parse.criteres,
                format.update,
                format.set,
                format.join,
                format.where,
                this.sendQuery.bind(this)
            ],
            function(err,result){
                if(err) reject(err);
                else resolve(result);
            }
        );

    });


}




/**
 * Effectue une requête de type SELECT sur une table d'boucle SPIP *
 * @param {string} boucle - L'boucle SPIP concerné (au **singulier**)
 * @param {(string|string[])} balises - La ou les balises (String ou array) demandées
 * @param {object} criteres - Un objet dont les couples propriétés/valeurs correspondent aux critères de sélection
 *
 * @return {object} - Le résultat de la requête sql
 */
Spip.prototype.select = function (boucle = throwIfMissing(), {balises = "*", criteres = null, order = null , connection = throwIfMissing()} = {}) {

    return new Promise((resolve, reject) =>{
        pipe(
            [
                (callback)=>parse.init({boucle:boucle, balises:balises, criteres:criteres,order:order, connection:connection},callback),
                parse.limit,
                parse.balises,
                parse.jointures,
                parse.criteres,
                format.select,
                format.join,
                format.joinInverse,
                format.where,
                format.groupby,
                format.orderby,
                format.limit,
                this.sendQuery.bind(this)
            ],
            function(err,result){
                if(err) reject(err);
                else resolve(result);
            }
        );

    });
}

Spip.prototype.count = function (boucle = throwIfMissing(), {balises = "*", criteres = null, order = null , connection = throwIfMissing()} = {}) {

     return new Promise((resolve, reject) =>{
         pipe(
             [
                 (callback)=>parse.init({boucle:boucle, balises:balises, criteres:criteres,order:order, connection:connection},callback),
                 parse.limit,
                 parse.balises,
                 parse.jointures,
                 parse.criteres,
                 format.selectCount,
                 format.join,
                 format.joinInverse,
                 format.where,
                 //format.groupby,
                 //format.orderby,
                 //format.limit,
                 this.sendQuery.bind(this)
             ],
             function(err,result){
                 if(err) reject(err);
                 else resolve(result);
             }
         );

     });
 }

Spip.prototype.sendQuery =  function(query,callback){
    if(!query.noQuery){
        console.log("query.connection",query.connection);
        this.spipquery.query(query.sql,query.connection)
        .then((result)=>callback(null,result))
        .catch((reason)=>callback(reason,null));
    }else{
        callback(null,query);
    }


}


//pour les tests en dev
Spip.prototype.log = function(query,callback){
    console.log("---------- query:\n",query);
    callback(null,query);
}

module.exports = Spip;

/**
* Gets called if a parameter is missing and the expression
* specifying the default value is evaluated.
*/
function throwIfMissing() {
    throw new Error('Missing parameter');
}
