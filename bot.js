require("dotenv").config();

const path = require("path");

const config = require('./config');
// console.log(config.token,process.env);

const { SlashCreator, GatewayServer } = require('slash-create');

const Eris = require('eris')
const bot = new Eris.Client(config.token);

const fs = require('fs')
const commands = []
const commandsAliases = {}

const membersMap = new Map();

const Pokemon = require("pokemon.js")
let seenChannels = [];

const db = require("./config").db;

fs.readdirSync('./commands').forEach(command => {
    const cmd = require(`./commands/${command}`)

    bot.on("error",console.warn);

    commands.push(cmd.name)
    if (cmd.aliases) { cmd.aliases.forEach(alias => { commandsAliases[alias] = cmd.name }) }
})
console.log(`Loaded ${commands.length} commands`)

bot.on('ready', () => {
    console.log('Ready');
    Pokemon.setLanguage("english");
})

bot.on('messageCreate', message => {
    if (message.author.bot) return
    if (message.channel.type === 1) return
    if (!message.content.startsWith(config.prefix)) return

    const args = message.content.slice(config.prefix.length).trim().split(/ +/g)
    const command = args.shift().toLowerCase()
    let cmd

    if (commands.includes(command)) cmd = require(`./commands/${command}`)
    else {
        for (const alias in commandsAliases) {
            if (alias === command) {
                cmd = require(`./commands/${commandsAliases[alias]}`)
            } else return
        }
    }

    try {
        if (cmd) {
            const perms = message.channel.permissionsOf(message.author.id)
            let argsMsg = `You did not provide the required arguments.`

            if (cmd.args && args.length != cmd.args) {
                if (cmd.usage) argsMsg += `\nUsage: \`${cmd.usage}\``
                return message.channel.createMessage(argsMsg)
            }
            if (cmd.permission && !perms.has(cmd.permission))
                return message.channel.createMessage('You do not have permission.')
            if (membersMap.get(message.author.id) === cmd.name)
                return message.channel.createMessage('Please wait before executing this command again.')

            if (cmd.cooldown && !perms.has('administrator')) {
                membersMap.set(message.author.id, cmd.name)
                setTimeout(() => { membersMap.delete(message.author.id) }, cmd.cooldown * 1000)
            }

            cmd.execute(message, args)
        }
    } catch (e) {
        console.error(e)
        message.channel.createMessage('There was an error trying to execute this command.')
    }
});

async function spawnPokemon(channelOrID, pokemonID){
    /** @type {Eris.TextChannel} */
    let channel = channelOrID;
    if(!channelOrID.id) channel = await bot.getChannel(channelOrID);
    // if(channelOrID.id) channel = channelOrID;
    if(!pokemonID){
        pokemonID = Math.floor(Math.random()*100) + 50;
    }

    let pkmnData = await Pokemon.getPokemon(pokemonID);
    let pkmnName = pkmnData["name"];
    // console.log(channel);
    // console.log(pkmnData);
    
    // leovl discord embed generator
    const embedWithMessage = {
        "content": "Wild Pokemon Appeared!",
        "embed": {
          "title": "Who's that pokemon? ",
          "description": "p:catch <pokemon name>",
          "url": "",
          "color": 9842162,
          "timestamp": (new Date()).toISOString(),
          "footer": {
            "icon_url": "https://cdn.discordapp.com/embed/avatars/0.png",
            "text": "Pokeswarm System at " + (new Date()).toLocaleString('en-US', { timeZone: config.TIMEZONE || 'America/Los_Angeles' })
          },
          "thumbnail": {
            "url": pkmnData["sprites"]["front_default"]
          },
          //"image": {
          //  "url": pkmnData["sprites"]["front_default"]
          //},
          "author": {
            "name": "Pokeswarm",
            "url": "https://discordapp.com",
            "icon_url": "https://cdn.discordapp.com/embed/avatars/0.png"
          },
          "fields": []
        }
      };
      console.log(embedWithMessage);
      console.log(channel.type);
      
      await db.set("pokemon-of-channel-" + channel.id, JSON.stringify(pkmnData));
      await channel.createMessage(embedWithMessage);
}

bot.on("typingStart", (channel) => {

    if(Math.random() < 0.25 && channel.id == "803134752344506389"){
        // 100% for testing
        console.log("Channel",channel.id);
        spawnPokemon(channel.id);
    }
});

const creator = new SlashCreator({
    applicationID: '862449173054750721',
    publicKey: config.pubkey,
    token: config.token,
    client: bot
  });
  
  creator
    .withServer(
      new GatewayServer(
        (handler) => bot.on('rawWS', (event) => {
          console.log("Interaction Recieved");
          if (event.t === 'INTERACTION_CREATE') handler(event.d);
        })
      )
    )
    .registerCommandsIn(path.join(__dirname, 'slash_commands'))
    .syncCommands();
  
setInterval(() => {
    // console.log(creator.commands.size);
},1000)
bot.connect();