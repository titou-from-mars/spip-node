var mysql = require("mysql2/promise");

class Database{
    constructor(config){
        this.config = config;
        this.config['multipleStatements'] = true;
        this.pool = mysql.createPool(
            this.config
        );
        //this.poolCluster.add(this.config.name, this.config);
    }

    connect(handler){
        this.pool.getConnection(handler);
    }
}

module.exports = Database;