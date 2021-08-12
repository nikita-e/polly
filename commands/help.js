const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Shows how to use this bot.',
    async execute(msg, args, client) {
        let prefix = client.guildSettings[msg.guild.id].prefix,
            fields = client.commands.map(command => {
                return {
                    name: command.name,
                    value: `- **${command.description}**\n- Usage: \`${command.usage ? `${prefix}${command.name} ${command.usage}` : `${prefix}${command.name}`}\``
                };
            });

        msg.channel.send({
            content: null,
            embeds: [
                new MessageEmbed()
                    .setColor('#' + Math.floor(Math.random() * 16777215).toString(16))
                    .setTitle('__**Help**__')
                    .setDescription('Here is a list of all usable commands:')
                    .addFields(fields)
            ]
        });
    },
};