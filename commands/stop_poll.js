const mongo = require('../modules/mongo');
const pollModel = require('../models/poll');
const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'close',
	description: 'Closes a poll.',
	usage: '<poll message ID>',
	minArgs: 1,
	async execute(msg, args, client) {
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

				// Don't allow someone else to close the poll.
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

				// Don't close closed poll.
				if (poll.closed) {
					msg.channel.send({
						embeds: [
							new MessageEmbed()
								.setColor('#FF2329')
								.setTitle('Error')
								.setDescription('That poll is already closed')
						]
					});
					return;
				}

				// Actually close the poll.
				require('../modules/stopPoll')(poll, client);
			} catch (e) {
				console.error(e);
			}
		});
	},
};