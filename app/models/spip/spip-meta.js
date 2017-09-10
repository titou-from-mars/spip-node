class SpipMeta{
    
    /**
     * Permet d'accéder aux meta spip
     * @param  {mysql} connection une connection mysql
     * @param  {spipQuery} spipQuery un objet spipQuery
     */
    constructor(connection,spipQuery){
        this.connection = connection;
        this.spipQuery = spipQuery;
    }
    get(meta){
        let sql = this.connection.format("SELECT * FROM `spip_meta` WHERE `nom` = ? ", [meta]);        
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