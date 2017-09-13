// pour coloriser les message des console.log()
var pipe = require('async-waterfall');
var tools = require('../../helpers/utils.js');
var spipQuery = require("./spip-query.js");
var spipMeta = require("./spip-meta.js");
var spip_boucles = require('./boucles.js');
var format = require("./spip-sql.js");
var parse = require("./boucles-parse.js");
const mysql = require('mysql2');
const createHash = require("sha.js");


function Spip(pool) {
    this.pool = pool;
    this.spipquery = new spipQuery(this.pool);
    this.champsInterdits = ["htpass", "pass", "low_sec"];
    this.meta = new spipMeta(this.spipquery);
}


Spip.prototype.count = function (boucle, balises, critères) {

}

Spip.prototype.login = function(login,pwd){
    return new Promise( (resolve,reject)=>{
        let query = "SELECT * FROM `spip_auteurs` WHERE `login`= " + mysql.escape(login)+" AND `statut` != '5poubelle';"; 
        this.spipquery.query(query)
        .then((rows)=>{
            let user, sha256, hash,message;
            let logged = false;
            let retour = {};            
            let login_exist = rows.length > 0;

            if(login_exist){
                user = rows[0];
                console.log("login exist".green);
                sha256 = createHash('sha256');
                hash = sha256.update(user['alea_actuel']+pwd, 'utf8').digest('hex');
                if(hash === user['pass']) logged = true;
            }else{
                console.log("le login n'existe pas !".red);
            }

            if(logged){
                 console.log("on retourne le user".green);
                resolve( {logged:logged,user:user});
            }else{
                console.log("on retourne un user vide".red);
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
 * Spip.lien("article",{liens:{id_mot:24},id:589})
 * @example
 * //asssocie les mots-clef correspondant à l'id_mot 12 et 56 et l'auteur id_auteur 5 aux articles id_article 15 & 22
 * Spip.lien("article",{liens:{id_mot:[12,56],id_auteur:5},id:[15,22])
 * 
 * @param {string} boucle - nom de la boucle SPIP
 * @param {object} queryParam - parametres de la requête
 * @param {object} queryParam.liens - un objet dont les propriétés correspondent aux id des objets à lier à l'élément SPIP
 * @param {number} queryParam.id - L'id de l'élément SPIP que l'on doit lier
 * 
 * @return 
 */
Spip.prototype.associer = function(boucle=throwIfMissing(),{liens = throwIfMissing(), id = throwIfMissing() }){

    return new Promise((resolve, reject) =>{        
        pipe(
            [
                (callback)=>parse.init({boucle:boucle,liens:liens,id:id},callback),
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
/**
 * Effectue une requête de type DELETE sur une table d'boucle SPIP. Cette requête supprime l'élément. Pour le mettre "à la poubelle",
 * il faut utiliser update pour mettre le statut à poubelle. La requête ne nettoie pas les tables de jointures.
 * @param  {string} boucle - L'boucle SPIP concerné (au **singulier**)
 * @param  {object} criteres - Un objet dont les couples propriétés/valeurs correspondent aux critères de sélection. Criteres est rendu obligatoire sur cette méthode pour éviter les catastrophes où toute une table est vidée
 * 
 * @return {object} - Le résultat de la requête sql
 */
Spip.prototype.delete = function(boucle = throwIfMissing() ,{criteres = throwIfMissing()}){
    
    return new Promise((resolve, reject) =>{        
        pipe(
            [
                (callback)=>parse.init({boucle:boucle,criteres:criteres},callback),
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
 * @param  {string} boucle - L'boucle SPIP concerné (au **singulier**)
 * @param  {object} set - Un objet dont les couples propriété/valeurs correspondent aux données à insérer
 * 
 * @return {object} - Le résultat de la requête sql
 */
Spip.prototype.insert = function (boucle = throwIfMissing(), {set=throwIfMissing()}) {
   
    return new Promise((resolve, reject) =>{        
        pipe(
            [
                (callback)=>parse.init({boucle:boucle, set:set},callback),            
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
Spip.prototype.update = function (boucle = throwIfMissing(), {set = null, criteres=null}={}) {

    return new Promise((resolve, reject) =>{        
        pipe(
            [
                (callback)=>parse.init({boucle:boucle, criteres:criteres,set:set},callback),
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
Spip.prototype.select = function (boucle = throwIfMissing(), {balises = "*", criteres = null} = {}) {
   
    return new Promise((resolve, reject) =>{        
        pipe(
            [
                (callback)=>parse.init({boucle:boucle, balises:balises, criteres:criteres},callback),
                parse.limit,
                parse.balises,
                parse.jointures,
                parse.criteres,
                format.select,
                format.join,
                format.where,
                format.groupby,
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
    this.spipquery.query(query.sql)
    .then((result)=>callback(null,result))
    .catch((reason)=>callback(reason,null));

}


module.exports = Spip;

/**
* Gets called if a parameter is missing and the expression
* specifying the default value is evaluated.
*/
function throwIfMissing() {
    throw new Error('Missing parameter');
}