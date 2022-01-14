const { SlashCommand, CommandOptionType } = require('slash-create');

module.exports = class HelloCommand extends SlashCommand {
  constructor(creator) {
    super(creator, {
      name: 'test',
      description: 'Tests stuff.',
      options: [{
        type: CommandOptionType.STRING,
        name: 'anything',
        description: 'A parameter!'
      }]
    });

    this.filePath = __filename;
  }

  async run(ctx) {
    return "Hi";
  }
}