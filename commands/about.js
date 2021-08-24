const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'about',
    description: 'Shows information about this bot.',
    async execute(msg, args, client) {
        if (!client.application?.owner) await client.application?.fetch();
        // Please don't remove this.
        msg.channel.send({
            embeds: [
                new MessageEmbed()
                    .setColor('#' + Math.floor(Math.random() * 16777215).toString(16))
                    .setTitle('__**About**__')
                    .setDescription(`
                    Bot created by \`Nikita E.#1674\`
                        Maintained by ${`<@${client.application?.owner.id}>` || client.application?.owner.name}
                    `)
                    .addFields({
                        name: 'Resources',
                        value: `Invite bot: ${client.invite}
                            Support server: https://discord.gg/HT5TTPe9Ta
                            Github: https://github.com/nikita-e/polly`
                    })
            ]
        });
    },
};