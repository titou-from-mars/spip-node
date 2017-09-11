class SpipQuery{

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

        return new Promise((resolve, reject) =>{
            this.pool.getConnection(function(err,connection){
                if(err) {
                    console.log("Erreur de connexion:",err);
                    reject(err);
                }else{
                    connection.query(sql, function (err, result, fields) {
                        connection.release();
                        if (err) {                            
                            console.log(err);
                            reject(err);                            
                        } else {  
                            resolve(result);
                        }
                
                    });
    
                }
            });

        });
        
        
    }

}    


module.exports = SpipQuery;