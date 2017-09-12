var express = require('express'), 
    router = express.Router();

router.get('/',function(req,res,next){
    req.spip.meta.get('nom_site')
    .then((retour)=>res.send('Bienvenue sur le serveur '+retour[0].valeur+'. Merci  de choisir une collection SPIP, ex, /articles/'))
    .catch((e)=>{
        console.log("Erreur :", e);
        res.status(500).send('Une erreur est survenue :-(');
    });
        
    
});
router.use(require('./auth'));
router.use(require('./auteurs'));
router.use(require('./publication'));
router.use(require('./collection'));
router.use(require('./collections'));

module.exports = router;