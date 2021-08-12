const { MessageEmbed } = require('discord.js');
const mongo = require('../modules/mongo');
const settingsModel = require('../models/settings');
const { defaultPrefix } = require('../config.json');

module.exports = {
    name: 'guildCreate',
    async execute(guild, client) {
        await mongo().then(async mongoose => {
            try {
                // Create record at DB.
                let query = await settingsModel.findOneAndUpdate(
                    {
                        _id: guild.id
                    },
                    {
                        prefix: defaultPrefix,
                        pingRoles: [],
                    },
                    {
                        upsert: true
                    }
                );

                // Load default settings to local cache.
                client.guildSettings[guild.id] = {
                    prefix: defaultPrefix,
                    pingRoles: []
                };

                // Send message to first channel.
                const channel = guild.channels.cache.find(channel => channel.type === 'GUILD_TEXT' && channel.permissionsFor(guild.me).has('SEND_MESSAGES'));
                if (channel) channel.send({
                    embeds: [
                        new MessageEmbed()
                            .setColor('#008000')
                            .setTitle('Hi \u{1f44b}')
                            .setDescription(`Thank you for adding me!\nMy default prefix is \`${defaultPrefix}\`. **You can change it by doing \`${defaultPrefix}setprefix <new prefix>\`.**`)
                    ]
                });
            } catch (e) {
                console.error(e);
            }
        });
    },
};