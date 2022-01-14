require("dotenv").config();
const Endb = require("endb");

module.exports = {
  token: process.env.TOKEN, // you tried
  prefix: 'p:',
  db: new Endb('sqlite://database.sqlite')
}

