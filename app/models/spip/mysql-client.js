class MysqlClient{

    constructor(pool){
        this.pool = pool;
    }


    /**
     * Effectue la requête SQL.
     * @param {string} sql - Une requête sql
     * @param {string} connection_name - L'identifiant de la connection dans l'array de connection de Database.js
     * 
     * @return {object} - le résultat de la requête sql
     */
    query (sql,connection_name){
        console.log("exécute la requête ",sql, "sur ", connection_name);

        return this.pool.getConnection(connection_name)
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