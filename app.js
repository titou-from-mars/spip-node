const express = require('express'),   
      serverParam = require('./config/server.json'),
      configureSpipServer = require('./app/configure'),    
      app = express();

app.set('env',serverParam.env);
app.set('case sensitive routing', serverParam.caseSensitive);
app.set('x-powered-by', serverParam.xPoweredBy);

configureSpipServer(app,serverParam.racine);

app.listen(serverParam.port,()=>{   
    console.log('Serveur écoute sur le port '+serverParam.port);    
});