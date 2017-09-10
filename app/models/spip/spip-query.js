class SpipQuery{

    constructor(connection){
        this.connection = connection;
    }


    /**
     * Effectue la requête SQL.
     * @param {string} - Une requête sql
     * 
     * @return {object} - le résultat de la requête sql
     */
    query (sql){
        //console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>exécute la requête :",sql);
        //return true;
        let query = this.connection.query(sql, function (err, result, fields) {
            if (err) {
                console.log("Erreur!!".red);
                console.trace(err);
                return err;
            } else {
                console.log("ok");
                console.log(result);
                return result;
            }
    
        });
    }

}    


module.exports = SpipQuery;