const express = require('express'),   
      serverParam = require('./config/server.json'),
      SpipServer = require('./app/spip-server'),    
      app = express();

app.set('env',serverParam.env);
app.set('case sensitive routing', serverParam.caseSensitive);
app.set('x-powered-by', serverParam.xPoweredBy);

const spip = new SpipServer(app,serverParam.racine);

app.listen(serverParam.port,()=>{   
    console.log('Serveur écoute sur le port '+serverParam.port);    
});