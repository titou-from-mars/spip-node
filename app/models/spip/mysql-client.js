class MysqlClient{

    constructor(pool){
        this.pool = pool;
    }


    /**
     * Effectue la requête SQL.
     * @param {string} - Une requête sql
     * 
     * @return {object} - le résultat de la requête sql
     */
    query (sql){
        console.log("exécute la requête :",sql);

        return this.pool.getConnection()
            .then((connection)=>{
                const res = connection.query(sql);
                connection.release();
                return res;
            })
            .then((result)=>{
               // console.log(result);
                return result[0];
            })
            .catch((err)=>{
                console.log(err.message);
                return Promise.reject(err);
            });
           
        
    }

}    


module.exports = MysqlClient;