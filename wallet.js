const EC = require("elliptic").ec;
const ec = new EC("secp256k1");
const crypto = require("crypto");

class Wallet {
  constructor() {
    this.keyPair = ec.genKeyPair();
    this.privateKey = this.keyPair.getPrivate("hex");
    this.publicKey = this.keyPair.getPublic("hex");
  }

  sign(data) {
    return this.keyPair.sign(data).toHex();
  }

  static verify(publicKey, signature, data) {
    const key = ec.keyFromPublic(publicKey, "hex");
    return key.verify(data, signature);
  }
}

module.exports = Wallet;
