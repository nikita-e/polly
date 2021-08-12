const { MessageEmbed } = require('discord.js');
const mongo = require('../modules/mongo');
const settingsModel = require('../models/settings');

module.exports = {
    name: 'setprefix',
    description: "Sets bot's prefix for this server.",
    usage: '<new prefix>',
    permissions: 'ADMINISTRATOR',
    minArgs: 1,
    async execute(msg, args, client) {
        await mongo().then(async mongoose => {
            try {
                await settingsModel.findOneAndUpdate({
                    _id: msg.guild.id
                }, {
                    prefix: args[0]
                }, {
                    upsert: true
                });
                client.guildSettings[msg.guild.id].prefix = args[0];

                msg.channel.send({
                    embeds: [
                        new MessageEmbed()
                            .setColor('#008000')
                            .setTitle('Success')
                            .setDescription(`The prefix for this bot is now \`${args[0]}\``)
                    ]
                });
            } catch (e) {
                console.error(e);
            }
        });
    },
};