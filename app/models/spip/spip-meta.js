const mysql = require('mysql2'),
      unserialize = require('../../helpers/php.unserialize.js');

class SpipMeta{
    
    /**
     * Permet d'accéder aux meta spip
     * @param  {spipQuery} spipQuery un objet spipQuery
     */
    constructor(spipQuery){        
        this.spipQuery = spipQuery;
        this.metaCache = null;
        this.cacheMeta();
    }

    cacheMeta(){
        return this.spipQuery.query("SELECT `nom`,`valeur` FROM `spip_meta` WHERE 1")
        .then((meta)=>{
            this.metaCache = {};
            // https://stackoverflow.com/questions/4748795/how-to-find-out-if-a-string-is-a-serialized-object-array-or-just-a-string            
            for(let i =0, len = meta.length; i < len; i++){
                (meta[i].valeur.match(/^a:\d+:{.*?}$/)) ? this.metaCache[meta[i].nom] = unserialize(meta[i].valeur) : this.metaCache[meta[i].nom] = meta[i].valeur;
            }
            return true;
        })
        .catch((e)=> {return e;});
    }

    recalcul(){
        this.metaCache = null;
        return this.cacheMeta()
        .then((retour)=>{
            return retour;
        })
        .catch((e)=> { return e});
    }
    
    get(meta){
        if(this.metaCache){
            console.log("get meta from cache:");
            return Promise.resolve(this.metaCache[meta]);
        }else{
            let sql = mysql.format("SELECT * FROM `spip_meta` WHERE `nom` = ? ", [meta]);        
            return this.spipQuery.query(sql);
        }
        
    }

    set(meta,value){

    }

    delete(meta){
        let sql = mysql.format("DELETE FROM `spip_meta` WHERE `nom` = ? ", [meta]);        
        return this.spipQuery.query(sql);
    }

    getAll(){               
        return this.spipQuery.query("SELECT * FROM `spip_meta` WHERE 1");
    }
}
module.exports = SpipMeta;