var db = require("./database.js");
var spip = require("../app/models/spip/spip.js");

var DB = new db();
var SPIP = new spip(DB.pool);

console.log("ok");