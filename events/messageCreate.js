const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'messageCreate',
    async execute(msg, client) {
        // Don't accept messages sent in DMs or by bots.
        if (!msg.guild) return;
        if (msg.author.bot) return;

        // Load guild's prefix from local cache.
        let prefix = client.guildSettings[msg.guild.id].prefix;

        if (msg.content.startsWith(prefix)) {
            if (msg.content.length === prefix.length) return;

            // Parse incoming command.
            const regex = new RegExp('"[^"]+"|[\\S]+', 'g');
            let args = [];
            msg.content.slice(prefix.length).trim().match(regex).forEach(element => {
                if (!element) return;
                return args.push(element.replace(/"/g, ''));
            });
            const command = args.shift().toLowerCase();

            if (!client.commands.has(command)) {
                msg.channel.send({
                    embeds: [
                        new MessageEmbed()
                            .setColor('#FF2329')
                            .setTitle('Error')
                            .setDescription(`Unknown command. Type \`${prefix}help\` for list of all commands`)
                    ]
                });
                return;
            }

            try {
                let localCommand = client.commands.get(command);

                // Check if we can't send message to this channel.
                if (!msg.channel.permissionsFor(msg.guild.me).has('SEND_MESSAGES')) return;

                // Check if user is allowed to execute this command.
                if (localCommand.permissions && !msg.member.permissions.any(localCommand.permissions)) {
                    msg.channel.send({
                        embeds: [
                            new MessageEmbed()
                                .setColor('#FF2329')
                                .setTitle('Error')
                                .setDescription("You aren't allowed to do this")
                        ]
                    });
                    return;
                }

                // Check arguments.
                if (localCommand.minArgs && args.length < localCommand.minArgs) {
                    msg.channel.send({
                        embeds: [
                            new MessageEmbed()
                                .setColor('#FF2329')
                                .setTitle('Error')
                                .setDescription(`The minimum number of arguments must be ${localCommand.minArgs}\nCommand usage: \`${localCommand.usage ? `${prefix}${localCommand.name} ${localCommand.usage}` : `${prefix}${localCommand.name}`}\``)
                        ]
                    });
                    return;
                }
                if (localCommand.maxArgs && args.length > localCommand.maxArgs) args = args.slice(0, localCommand.maxArgs);

                // Execute.
                localCommand.execute(msg, args, client);
            } catch (error) {
                console.error(error);
                msg.channel.send('There was an error trying to execute that command!');
            }

        }
    }
};