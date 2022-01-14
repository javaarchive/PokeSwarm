const fs = require('fs')
const { prefix, db } = require('../config')

module.exports = {
  name: 'catch',
  description: 'Makes a catch attempt. ',
  cooldown: 5,

  async execute(message, args) {
    let msg = "You guessed the pokemon incorrect. Try again. ";
    let guess = args[0].toLowerCase();

    let pkmnData = JSON.parse(await db.get("pokemon-of-channel-" + message.channel.id));
    console.log(args[0]);
    console.log(pkmnData);
    if(!pkmnData){
      msg = "No pokemon exists is in this channel. ";
    }else if(guess == pkmnData["name"].toLowerCase()){
      msg = "Guess correct, TODO: Add something else here";
    }

    await message.channel.createMessage(msg)
  }
}