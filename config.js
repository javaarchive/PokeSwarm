require("dotenv").config();
const Keyv = require("keyv");

module.exports = {
  token: process.env.TOKEN, // you tried
  prefix: 'p:',
  db: new Keyv('sqlite://database.sqlite')
}

