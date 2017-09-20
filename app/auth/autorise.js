const minimumRole = require('../../config/security.json').minimumRole;
module.exports = function(requiredRole) {
    return function (req, res, next) {
        console.log("Role nécessaire :",requiredRole,", user role:",req.user.role);
        if(req.user.role >= requiredRole && req.user.role >= minimumRole) next();
        else res.status(403).json({
            status:"fail",
            data:{ "reason":"Vous n'avez pas les droits nécessaires pour effectuer cette action"}
        });        

    }
};
