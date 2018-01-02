const mysql       = require('mysql2'),
      unserialize = require('../../helpers/php.unserialize.js');

class Meta {

  /**
   * Permet d'accéder aux metas spip
   * @param  {MysqlClient} mysqlClient un objet MysqlClient
   */
  constructor(mysqlClient) {
    this.mysqlClient = mysqlClient;
    this.metaCache = {};
  }

  cacheMeta(meta,value,connectionID){
    if (!this.metaCache[connectionID]) {
      this.metaCache[connectionID] = {};
    }
    this.metaCache[connectionID][meta] = value;
    return value;
  }

  cacheAllMeta(connectionID) {
    return this.mysqlClient.query("SELECT `nom`,`valeur` FROM `spip_meta` WHERE 1",connectionID)
      .then((meta) => {
        this.metaCache[connectionID] = {};
        // https://stackoverflow.com/questions/4748795/how-to-find-out-if-a-string-is-a-serialized-object-array-or-just-a-string
        for (let i = 0, len = meta.length; i < len; i++) {
          this.metaCache[connectionID][meta[i].nom] = this.decodeMeta(meta[i].valeur);
        }
        return true;
      })
      .catch((e) => {
        return e;
      });
  }

  /**
   * Test si la meta transmise est serializée. Si oui, la décode et la renvoi, sinon, la renvoi telle quelle
   *
   * @param {string} meta - la valeur de la meta
   * @memberof Meta
   */
  decodeMeta(meta) {
    if (meta.match(/^a:\d+:{.*?}$/)) return unserialize(meta);
    else return meta;
  }

  recalcul(connectionID) {
    this.metaCache[connectionID] = null;
    return this.cacheAllMeta(connectionID)
      .then((retour) => {
        return retour;
      })
      .catch((e) => {
        return e
      });
  }

  get(meta,connectionID) {
    console.log('meta', meta);
    if(meta.indexOf(',') > -1){
      console.log('on a trouvé une virgule');
      meta = JSON.parse(meta);
      let sql = "SELECT * FROM `spip_meta` WHERE `nom` IN(";
      let first = true;
      for(let i = 0, len = meta.length; i < len; i++){
        (!first)? sql += ',' : first = false;
        sql += `'${meta[i]}'`;
      }
      sql += ')';
      return this.mysqlClient.query(sql,connectionID).then(retour => {
        return retour;
      });

    }else{
      console.log('pas de virgule');
      if (this.metaCache[connectionID] && this.metaCache[connectionID][meta]) {
        console.log("get meta from",connectionID,"cache");
        return Promise.resolve(this.metaCache[connectionID][meta]);
      } else {
        console.log("get meta from sql");
        let sql = mysql.format("SELECT * FROM `spip_meta` WHERE `nom` = ? ", [meta]);
        return this.mysqlClient.query(sql,connectionID).then((retour) => {
          return this.cacheMeta(meta, this.decodeMeta(retour[0].valeur) ,connectionID);
        });
      }

    }

  }

  set(meta, value,connectionID) {

  }

  delete(meta,connectionID) {
    let sql = mysql.format("DELETE FROM `spip_meta` WHERE `nom` = ? ", [meta]);
    return this.mysqlClient.query(sql,connectionID);
  }

  getAll(connectionID) {
    return this.mysqlClient.query("SELECT * FROM `spip_meta` WHERE 1",connectionID);
  }
}
module.exports = Meta;