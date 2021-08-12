const mongo = require('../modules/mongo');
const pollModel = require('../models/poll');
const { MessageEmbed, MessageActionRow, MessageButton, Message } = require('discord.js');

module.exports = {
	name: 'poll',
	description: 'Creates a poll.',
	usage: '<time> <title> <question> <anonymous (true/false or yes/no)> <multiple (true/false or yes/no)> <option1> <option2> [option3 (optional)] [option4 (optional)] etc.',
	minArgs: 7,
	maxArgs: 29,
	async execute(msg, args, client) {
		// Get arguments.
		let [recvTime, title, question, anonymous, multiple, ...options] = args;

		// Process time.
		recvTime = recvTime.split(/([0-9]+)/).filter(Boolean),
			time = require('../modules/dateAdd.js')(new Date(), parseInt(recvTime[0]), recvTime[1]);
		if (!time) {
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

		// Create an embed.
		let embed = new MessageEmbed()
			.setColor('#008000')
			.setTitle(`__**${title}**__`)
			.setDescription(`**${question}**\nEnds: <t:${Math.round(time.getTime() / 1000)}:R>\nPoll by <@${msg.author.id}>`)
			.setFooter('Vote by clicking on a button');

		// Button stuff.
		let components = [];
		// Create Cancel button now. Otherwise, it can cause errors which will crash bot.
		options.push(
			new MessageButton()
				.setCustomId('-1')
				.setLabel('Cancel vote')
				.setStyle('DANGER')
			//.setEmoji('❌')
		);
		// Math time. This function separates options into 5 MessageActionRows, 5 buttons per each row.
		for (let i = 0; i < options.length; i += 5) {
			let tmp = options.slice(i, i + 5),
				row = new MessageActionRow();

			for (let j = 0; j < tmp.length; j++) {

				if (tmp[j] instanceof MessageButton) row.addComponents(tmp[j]);
				else row.addComponents(
					new MessageButton()
						.setCustomId((i + j).toString())
						.setLabel(tmp[j])
						.setStyle('SECONDARY')
				);
			}

			components.push(row);
		}
		// Remove Cancel button. We don't need it anymore.
		options.pop();


		// Parse anonymous and multiple arguments.
		switch (anonymous) {
			case 'yes':
			case 'true':
				anonymous = true;
				break;

			case 'no':
			case 'false':
				anonymous = false;
				break;

			default:
				msg.channel.send({
					embeds: [
						new MessageEmbed()
							.setColor('#FF2329')
							.setTitle('Error')
							.setDescription('`Anonymous` argument has incorrect value')
					]
				});
				return;
		}
		if (!anonymous) embed.addFields(options.map(option => {
			return {
				name: `${option} (0)`,
				value: 'No votes',
				inline: true
			};
		}));

		switch (multiple) {
			case 'yes':
			case 'true':
				multiple = true;
				embed.description += '\n**Multiple votes are allowed**';
				break;

			case 'no':
			case 'false':
				multiple = false;
				embed.description += '\n**Only one vote per person is allowed**';
				break;

			default:
				msg.channel.send({
					embeds: [
						new MessageEmbed()
							.setColor('#FF2329')
							.setTitle('Error')
							.setDescription('`Multiple` argument has incorrect value')
					]
				});
				return;
		}

		// Send our poll.
		await msg.channel.send({
			content: client.guildSettings[msg.guild.id].pingRoles.map(role => `<@&${role}>`).join(' ') || null,
			embeds: [embed],
			components,
		}).then(async (poll) => {
			// Delete original message.
			if (msg instanceof Message) msg.delete();

			await mongo().then(async mongoose => {
				try {
					// Save our poll to DB.
					await pollModel.create({
						_id: poll.id,
						authorId: msg.author.id,
						channelId: poll.channel.id,
						closeAt: time,
						anonymous,
						multiple,
						embed,
						buttons: components,
						votes: Array(options.length).fill([]),
					});
				} catch (e) {
					console.error(e);
				}
			});
		});
	},
};