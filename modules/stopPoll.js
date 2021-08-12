const mongo = require('../modules/mongo');
const pollModel = require('../models/poll');
const { MessageEmbed } = require('discord.js');

module.exports = async function (poll, client) {
	let resultsFooter;
	poll.embed = new MessageEmbed(poll.embed)
		.setColor(null)
		.setFooter('Poll closed');

	const findLongest = (arr) => {
		let max = Math.max(...arr.map(opt => opt.length));

		for (let index in arr) {
			if (arr[index].length === max)
				return {
					max,
					index: parseInt(index)
				};
		}
	};

	let { max: maxVotes, index } = findLongest(poll.votes);

	if (maxVotes === 0) {
		//poll.embed.setFooter('Poll closed • Nobody has voted');
		resultsFooter = 'Nobody has voted in the poll';
	} else {
		let button = poll.buttons[Math.floor(index / 5)].components[index % 5];
		resultsFooter = `Option **${button.label}** has won with ${maxVotes} votes`;
		button.style = 'SUCCESS';
	}

	poll.buttons.forEach(row => row.components.forEach(button => {
		button.disabled = true;
		if (button.style === 'PRIMARY') button.style = 'SECONDARY';
	}));


	client.channels.cache.get(poll.channelId).messages.fetch(poll._id).then(pollMsg => {
		pollMsg.edit({
			embeds: [poll.embed],
			components: poll.buttons
		});

		pollMsg.channel.send({
			embeds: [
				new MessageEmbed()
					.setTitle(`__${poll.embed.title}__`)
					.setDescription(`${resultsFooter} [\u2197](${pollMsg.url})`)
			]
		});
	});

	await mongo().then(async mongoose => {
		try {
			await pollModel.findOneAndUpdate(
				{
					_id: poll.id,
				},
				{
					closed: true,
					embed: poll.embed,
					buttons: poll.buttons
				}, {
				upsert: true,
			});
		} catch (e) {
			console.error(e);
		}
	});
}