var express = require('express'), 
    router = express.Router();

router.get('/',function(req,res,next){
    res.send('Merci  de choisir une collection SPIP, ex, /articles/');
});
router.use(require('./auth'));
router.use(require('./auteurs'));
router.use(require('./publication'));
router.use(require('./collection'));
router.use(require('./collections'));

module.exports = router;