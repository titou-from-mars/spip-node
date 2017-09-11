var mysql = require("mysql2");

class Database{
    constructor(config){
        this.config = config;
        this.poolCluster = mysql.createPoolCluster();
        this.poolCluster.add(this.config.name, this.config);
    }

    connect(handler){
        this.poolCluster.getConnection(this.config.name, handler);
    }
}

module.exports = Database;