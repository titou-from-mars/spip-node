var mysql = require("mysql2/promise");

class Database{
    
    constructor(configs){
        this.activeConnection = null;
        this.connectionList = [];
        this.pool = [];
        for(let i = 0, l = configs.length ; i < l ; i++) 
            this.addConnection(configs[i]);
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
        this.connectionList.push(name);

    }

    getConnection(connectionName=null){
        if(!connectionName) return this.pool[this.activeConnection].getConnection();
        else return this.pool[connectionName].getConnection();    
    }
    
}

function throwIfMissing() {
    throw new Error('Missing parameter');
}

module.exports = Database;