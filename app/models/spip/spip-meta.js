var mysql = require('mysql2');
class SpipMeta{
    
    /**
     * Permet d'accéder aux meta spip
     * @param  {spipQuery} spipQuery un objet spipQuery
     */
    constructor(spipQuery){        
        this.spipQuery = spipQuery;
    }
    get(meta){
        let sql = mysql.format("SELECT * FROM `spip_meta` WHERE `nom` = ? ", [meta]);        
        return this.spipQuery.query(sql);
    }

    set(meta,value){

    }

    delete(meta){

    }

    getAll(){               
        return this.spipQuery.query("SELECT * FROM `spip_meta` WHERE 1");
    }
}
module.exports = SpipMeta;