const { MessageEmbed } = require('discord.js');
const mongo = require('../modules/mongo');
const pollModel = require('../models/poll');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        // Proceed only if button was clicked.
        if (interaction.isButton()) {
            await mongo().then(async mongoose => {
                try {
                    // Try to find our poll at DB.
                    let poll = await pollModel.findOne({ _id: interaction.message.id });
                    if (!poll) {
                        interaction.reply({
                            embeds: [
                                new MessageEmbed()
                                    .setColor('#FF2329')
                                    .setTitle('Oops')
                                    .setDescription(`Something crashed. Please report this to developers.\nError information: \`cannot find poll ${interaction.message.id} in DB\`.`)
                            ],
                            ephemeral: true
                        });
                        return;
                    }

                    let embed = new MessageEmbed().setDescription("You haven't voted yet"),
                        btnId = parseInt(interaction.customId),
                        userId = interaction.member.user.id;


                    // Function to remove user's vote from array and embed.
                    const remove = (option, vote, id) => {
                        option.splice(option.indexOf(vote), 1);

                        if (!poll.anonymous) {
                            // Some magic. If poll isn't anonymous, we remove user's mention from embed.
                            let field = poll.embed.fields[id];
                            field.name = `${field.name.slice(0, -(3 + (option.length + 1).toString().length))} (${option.length})`; // bruh
                            field.value = field.value.replace(new RegExp(`<@${userId}>`, 'g'), '').trim();
                            if (field.value.length === 0) field.value = 'No votes';
                        }

                        embed.setDescription('You have cancelled your vote.');
                    };

                    // Remove all previous votes if poll isn't multiple or cancel button is clicked.
                    if (!poll.multiple || (poll.multiple && btnId < 0)) poll.votes.forEach((option, id) => {
                        if (id === btnId && btnId >= 0) return; // Don't touch current option.

                        let vote = option.find(id => id === userId);
                        if (vote) remove(option, vote, id);
                    });

                    // Most important part. Here we process button click.
                    if (btnId >= 0) {
                        let option = poll.votes[btnId],
                            vote = option.find(id => id === userId);
                        if (vote) {
                            // If poll is multiple-choice and we have already voted for this, remove our vote.
                            if (poll.multiple) remove(option, vote, btnId);
                            else embed.setDescription('You have already voted for this option.');
                        } else {
                            // Add user's id to selected option.
                            poll.votes[btnId].push(userId);

                            if (!poll.anonymous) {
                                // Some magic again.
                                let field = poll.embed.fields[btnId];
                                field.value += `\n<@${userId}>`;
                                field.value = field.value.replace(/No votes/g, '').trim();
                                field.name = `${field.name.slice(0, -(3 + (poll.votes[btnId].length - 1).toString().length))} (${poll.votes[btnId].length})`;
                            }

                            embed.setDescription(`You have voted for option **${poll.buttons[Math.floor(btnId / 5)].components[btnId % 5].label}**`);
                        }
                    }

                    // If poll isn't anonymous, update embed because a field has changed.
                    if (!poll.anonymous) client.channels.cache.get(poll.channelId).messages.fetch(poll._id).then(pollMsg => {
                        pollMsg.edit({
                            embeds: [poll.embed]
                        });
                    });

                    // Send an ephemeral message to user.
                    interaction.reply({
                        embeds: [embed],
                        ephemeral: true
                    });

                    // Update data at DB.
                    await pollModel.findOneAndUpdate(
                        {
                            _id: interaction.message.id,
                        },
                        {
                            votes: poll.votes,
                            embed: poll.embed
                        }, {
                        upsert: true,
                        useFindAndModify: false
                    });
                } catch (e) {
                    console.error(e);
                }
            });
        }
    }
};