const mongo = require('../modules/mongo');
const pollModel = require('../models/poll');
const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'results',
    description: 'Gets results of a poll.',
    usage: '<poll message ID>',
    minArgs: 1,
    async execute(msg, args) {
        await mongo().then(async mongoose => {
            try {
                // Try to find a poll.
                let poll = await pollModel.findOne({ _id: args[0] });
                if (!poll) {
                    msg.channel.send({
                        embeds: [
                            new MessageEmbed()
                                .setColor('#FF2329')
                                .setTitle('Error')
                                .setDescription('Cannot find that poll')
                        ]
                    });
                    return;
                }

                // Don't send results of an open anonymous poll to prevent sheeping.
                if (!poll.closed && poll.anonymous) {
                    msg.channel.send({
                        embeds: [
                            new MessageEmbed()
                                .setColor('#FF2329')
                                .setTitle('Error')
                                .setDescription('Cannot show results of an open anonymous poll')
                        ]
                    });
                    return;
                }

                // Send actual message.
                msg.channel.send({
                    embeds: [
                        new MessageEmbed()
                            .setTitle(`Results of poll __${poll.embed.title}__`)
                            .addFields(poll.votes.map((option, index) => {
                                return {
                                    name: poll.buttons[Math.floor(index / 5)].components[index % 5].label,
                                    value: (poll.anonymous) ? ((option.length === 0) ? 'No votes' : `${option.length} votes`) : poll.embed.fields[index].value,
                                    inline: true
                                }
                            }))
                    ]
                });
            } catch (e) {
                console.error(e);
            }
        });
    },
};