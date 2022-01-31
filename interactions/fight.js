const Eris = require("eris");

const db = require("../config").db;

module.exports = {
    /** @param {Eris.ComponentInteraction} interaction */
    execute: async function (interaction) {
        await interaction.acknowledge();
        
        let msg = await interaction.getOriginalMessage();
        let pokemonList = await db.get("pokemon-" + msg.author.id)

        await interaction.createFollowup({
            content: "Followup Test",
            flags: 64 // ephermal
        })
    }
}