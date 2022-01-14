require("dotenv").config();
const Endb = require("endb");

module.exports = {
  token: process.env.TOKEN, // you tried
  prefix: 'p:',
  pubkey: process.env.PUBKEY,
  db: new Endb('sqlite://database.sqlite')
}

