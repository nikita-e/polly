const { MessageEmbed } = require('discord.js');
const mongo = require('../modules/mongo');
const settingsModel = require('../models/settings');

module.exports = {
    name: 'roles',
    description: 'Sets roles that bot will ping on every poll.',
    usage: '<action (add, remove, clear or list)> <@role1> <@role2> etc.',
    permissions: 'ADMINISTRATOR',
    minArgs: 1,
    async execute(msg, args, client) {
        let [action] = args,
            roles = client.guildSettings[msg.guild.id].pingRoles,
            pingRoles = msg.mentions.roles.map(role => role.id);


        /*
        if (pingRoles.length === 0) {
            msg.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setColor('#FF2329')
                        .setTitle('Error')
                        .setDescription("You haven't mentioned any roles")
                ]
            });
            return;
        }
        */

        // Decide what we should do.
        switch (action) {
            case 'add':
                roles.push(...pingRoles);
                break;

            case 'remove':
                pingRoles.forEach(role => {
                    let index = roles.indexOf(role);

                    if (index > -1) roles.splice(index, 1);
                });
                break;

            case 'clear':
                roles = [];
                break;

            case 'list':
                msg.channel.send({
                    embeds: [
                        new MessageEmbed()
                            .setColor('#008000')
                            .setTitle('Ping roles')
                            .setDescription(`These are roles that bot will ping on every poll:\n${roles.map(role => `<@&${role}>`).join(' ') || 'No roles'}`)
                    ]
                });
                return;

            default:
                msg.channel.send({
                    embeds: [
                        new MessageEmbed()
                            .setColor('#FF2329')
                            .setTitle('Error')
                            .setDescription('`Action` argument has incorrect value')
                    ]
                });
                return;
        }


        await mongo().then(async mongoose => {
            try {
                // Update data at DB.
                await settingsModel.findOneAndUpdate({
                    _id: msg.guild.id
                }, {
                    pingRoles: roles
                }, {
                    upsert: true
                });

                // Update local cache.
                client.guildSettings[msg.guild.id].pingRoles = roles;

                msg.channel.send({
                    embeds: [
                        new MessageEmbed()
                            .setColor('#008000')
                            .setTitle('Success')
                            .setDescription("Updated server's ping roles")
                    ]
                });
            } catch (e) {
                console.error(e);
            }
        });
    },
};