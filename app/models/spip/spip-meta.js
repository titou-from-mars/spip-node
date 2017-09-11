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
        this.spipQuery.query(sql);
    }

    set(meta,value){

    }

    delete(meta){

    }

    getAll(){

    }
}
module.exports = SpipMeta;