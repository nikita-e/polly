const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'ping',
	description: 'Pings the bot.',
	async execute(msg, args, client) {
		msg.channel.send('Pinging...').then(sent => {
			sent.edit({
				content: null,
				embeds: [
					new MessageEmbed()
						.setColor('#' + Math.floor(Math.random() * 16777215).toString(16))
						.setTitle('__**Pong!**__')
						.addFields(
							{ name: '\u{1f493} Heartbeat', value: `${client.ws.ping} ms` },
							{ name: '\u{23f1} Latency', value: `${sent.createdTimestamp - msg.createdTimestamp} ms` }
						)
				]
			});
		});
	},
};