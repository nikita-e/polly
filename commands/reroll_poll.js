const mongo = require('../modules/mongo');
const pollModel = require('../models/poll');
const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'reroll',
    description: 'Rerolls a poll.',
    minArgs: 1,
    usage: "<poll message ID> <new time period (optional if poll isn't outdated)>",
    async execute(msg, args, client) {
        let [_id, newTime] = args;

        await mongo().then(async mongoose => {
            try {
                // Try to find a poll.
                let poll = await pollModel.findOne({ _id });
                if (!poll) {
                    msg.channel.send(
                        new MessageEmbed()
                            .setColor('#FF2329')
                            .setTitle('Error')
                            .setDescription('Cannot find that poll')
                    );
                    return;
                }

                // Don't allow someone else to reroll the poll.
				if (poll.authorId !== msg.author.id && !msg.member.permissions.has('ADMINISTRATOR')) {
					msg.channel.send({
						embeds: [
							new MessageEmbed()
								.setColor('#FF2329')
								.setTitle('Error')
								.setDescription("That poll isn't from you")
						]
					});
					return;
				}

                // Parse time.
                if (newTime) {
                    let recvTime = newTime.split(/([0-9]+)/).filter(Boolean),
                        time = require('../modules/dateAdd.js')(new Date(), parseInt(recvTime[0]), recvTime[1]);

                    if (!time && newTime) {
                        msg.channel.send({
                            embeds: [
                                new MessageEmbed()
                                    .setColor('#FF2329')
                                    .setTitle('Error')
                                    .setDescription('Time is incorrect')
                            ]
                        });
                        return;
                    }

                    poll.closeAt = time;
                    poll.embed.description = poll.embed.description.replace(/<t:(\w+):\w>/g, `<t:${Math.round(time.getTime() / 1000)}:R>`);
                } else if (new Date() >= poll.closeAt) {
                    msg.channel.send({
                        embeds: [
                            new MessageEmbed()
                                .setColor('#FF2329')
                                .setTitle('Error')
                                .setDescription('Please enter new time period')
                        ]
                    });
                    return;
                }

                // Recreate the embed so we can edit it using native methods.
                poll.embed = new MessageEmbed(poll.embed)
                    .setColor('#008000')
                    .setFooter('Vote by clicking on a button');

                // Clear fields if poll isn't anonymous.
                if (!poll.anonymous) poll.votes.forEach((option, id) => {
                    let field = poll.embed.fields[id];
                    field.name = `${field.name.slice(0, -(3 + (option.length + 1).toString().length))} (0)`;
                    field.value = 'No votes';
                });

                // Reactivate buttons.
                poll.buttons.forEach(row => row.components.forEach(button => {
                    button.disabled = false;
                    if (button.style === 'SUCCESS' || button.style === 'SECONDARY') button.style = 'PRIMARY';
                }));

                client.channels.cache.get(poll.channelId).messages.fetch(_id).then(pollMsg => {
                    // Update poll's message.
                    pollMsg.edit({
                        embeds: [poll.embed],
                        components: poll.buttons
                    });

                    // Send small notification.
                    pollMsg.channel.send({
                        content: client.guildSettings[msg.guild.id].pingRoles.map(role => `<@&${role}>`).join(' ') || null,
                        embeds: [
                            new MessageEmbed()
                                .setTitle(`__${poll.embed.title}__`)
                                .setDescription(`A poll has been rerolled! Vote again [\u2197](${pollMsg.url})`)
                        ]
                    });
                });

                // Update data at DB.
                await pollModel.findOneAndUpdate(
                    {
                        _id,
                    },
                    {
                        closeAt: poll.closeAt,
                        closed: false,
                        embed: poll.embed,
                        buttons: poll.buttons,
                        votes: Array(poll.votes.length).fill([]),
                    }, {
                    upsert: true,
                });
            } catch (e) {
                console.error(e);
            }
        });
    },
};