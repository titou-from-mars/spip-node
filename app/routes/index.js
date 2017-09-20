var express = require('express'), 
    router = express.Router(),
    passport = require('passport');

router.get('/',function(req,res,next){
    req.spip.meta.get('nom_site')
    .then((retour)=>res.send('Bienvenue sur le serveur '+retour+'. Merci  de choisir une boucle SPIP, ex, /articles/'))
    .catch((e)=>{
        console.log("Erreur :", e);
        res.status(500).send('Une erreur est survenue :-(');
    });        
    
});

router.use(require('./auth'));

//Toutes les routes après cette ligne nécessiterons une identification
//router.use(passport.authenticate('jwt', { session: false }));
// passeport decode le JWT token s'il est présent, mais il ne bloque plus l'accès. C'est auth/autorise.js qui s'en charge.
router.all('*',function(req,res,next){    
    passport.authenticate('jwt', (err, user, info)=> {        
        (!user)? req.user = {role:0} : req.user = user;
        next();
    })(req, res, next);     
});

router.use(require('./auteurs'));
router.use('/admin/',require('./admin'));
router.use(require('./raccourci.js'));
router.use(require('./publication'));
router.use(require('./boucles'));
router.use(require('./boucle'));


//404
router.all('*', function(req, res){
    res.status(404).send("Ressource inconnue");
});



module.exports = router;