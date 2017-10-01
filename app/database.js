var mysql = require("mysql2/promise");

class Database{
    
    constructor(configs){
        this.activeConnection = null;
        this.pool = [];
        for(let i = 0, l = configs.length ; i < l ; i++) 
            this.addConnection(configs[i]);
        /*this.config = config;
        this.config['multipleStatements'] = true;
        this.pool = mysql.createPool(
            this.config
        );*/
        //this.poolCluster.add(this.config.name, this.config);
    }

    addConnection({
        name=throwIfMissing(),
        database=throwIfMissing(),
        connectionLimit=10,
        debug=false,
        host='localhost',        
        user='root',
        password=''
    }){
        this.pool[name] = mysql.createPool(
            {
                database:database,
                connectionLimit:connectionLimit,
                host:host,
                user:user,
                password:password,
                multipleStatements:true
            }

        );
        if(!this.activeConnection) this.activeConnection = name;

    }

    getConnection(connectionName=null){
        if(!connectionName) return this.pool[this.activeConnection].getConnection();
        else return this.pool[connectionName].getConnection();    
    }

    connect(handler){
        this.pool['TEST'].getConnection(handler);
    }
}

function throwIfMissing() {
    throw new Error('Missing parameter');
}

module.exports = Database;