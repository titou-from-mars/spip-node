var express = require('express'), 
    router = express.Router();

router.get('/',function(req,res,next){
    res.send('Merci  de choisir une collection SPIP, ex, /articles/');
});

module.exports = router;