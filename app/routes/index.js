var express = require('express'), 
    router = express.Router(),
    passport = require("passport");

router.get('/',function(req,res,next){
    req.spip.meta.get('nom_site')
    .then((retour)=>res.send('Bienvenue sur le serveur '+retour[0].valeur+'. Merci  de choisir une boucle SPIP, ex, /articles/'))
    .catch((e)=>{
        console.log("Erreur :", e);
        res.status(500).send('Une erreur est survenue :-(');
    });        
    
});

router.use(require('./auth'));

//Toutes les routes après cette ligne nécessiterons une identification
router.use(passport.authenticate('jwt', { session: false }));
router.use(require('./auteurs'));
router.use(require('./raccourci.js'));
router.use(require('./publication'));
router.use(require('./boucles'));
router.use(require('./boucle'));


//404
router.all('*', function(req, res){
    res.status(404).send("Ressource inconnue");
});



module.exports = router;