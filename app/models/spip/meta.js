const mysql       = require('mysql2'),
      unserialize = require('../../helpers/php.unserialize.js');

class Meta {

  /**
   * Permet d'accéder aux metas spip
   * @param  {MysqlClient} mysqlClient un objet MysqlClient
   */
  constructor(mysqlClient) {
    this.mysqlClient = mysqlClient;
    this.metaCache = null;
    this.cacheMeta();
  }

  cacheMeta() {
    return this.mysqlClient.query("SELECT `nom`,`valeur` FROM `spip_meta` WHERE 1")
      .then((meta) => {
        this.metaCache = {};
        // https://stackoverflow.com/questions/4748795/how-to-find-out-if-a-string-is-a-serialized-object-array-or-just-a-string            
        for (let i = 0, len = meta.length; i < len; i++) {
          this.metaCache[meta[i].nom] = this.decodeMeta(meta[i].valeur);
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

  recalcul() {
    this.metaCache = null;
    return this.cacheMeta()
      .then((retour) => {
        return retour;
      })
      .catch((e) => {
        return e
      });
  }

  get(meta) {
    if (this.metaCache) {
      console.log("get meta from cache");
      return Promise.resolve(this.metaCache[meta]);
    } else {
      console.log("get meta from sql");
      let sql = mysql.format("SELECT * FROM `spip_meta` WHERE `nom` = ? ", [meta]);
      return this.mysqlClient.query(sql).then((retour) => {
        return this.decodeMeta(retour[0].valeur);
      });
    }

  }

  set(meta, value) {

  }

  delete(meta) {
    let sql = mysql.format("DELETE FROM `spip_meta` WHERE `nom` = ? ", [meta]);
    return this.mysqlClient.query(sql);
  }

  getAll() {
    return this.mysqlClient.query("SELECT * FROM `spip_meta` WHERE 1");
  }
}
module.exports = Meta;