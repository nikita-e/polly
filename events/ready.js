const fs = require('fs');
const mongo = require('../modules/mongo');
const settingsModel = require('../models/settings');
const pollModel = require('../models/poll');
const config = require('../config.json');
const { Collection } = require('discord.js');

module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {
		// Load commands.
		client.commands = new Collection();
		const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
		for (const file of commandFiles) {
			const command = require(`../commands/${file}`);
			client.commands.set(command.name, command);
			/*
			if (command.aliases) {
				command.aliases.forEach(alias => client.commands.set(alias, command));
			}
			*/
		}

		await mongo().then(async mongoose => {
			try {
				// Load guilds' prefixes to local cache.
				client.guildSettings = {};
				for (const guild of client.guilds.cache) {
					const id = guild[1].id;

					let result = await settingsModel.findOne({ _id: id });
					if (!result) {
						await settingsModel.create({
							_id: id,
						});

						result = {
							prefix: config.defaultPrefix,
							pingRoles: []
						};
					}

					client.guildSettings[id] = {
						prefix: result.prefix,
						pingRoles: result.pingRoles,
					};
				}

				// Create an interval to check opened polls and close some if needed.
				setInterval(async () => {
					let polls = await pollModel.find({
						closed: false
					});

					polls.forEach(poll => {
						if (new Date() >= poll.closeAt) require('../modules/stopPoll')(poll, client);
					});
				}, 1000);
			} catch (e) {
				console.error(e);
			}
		});

		// Set bot's status.
		client.user.setPresence({
			activities: [
				{
					name: `for commands (${config.defaultPrefix})`,
					type: 'WATCHING'
				}
			]
		});

		// Generate invite.
		client.invite = client.generateInvite({
			scopes: ['bot'],
			permissions: [
				'VIEW_CHANNEL', 
				'SEND_MESSAGES', 
				'MANAGE_MESSAGES', 
				'ATTACH_FILES', 
				'READ_MESSAGE_HISTORY', 
				'MENTION_EVERYONE'
			]
		});
		console.log(`${client.user.tag} has logged in. ${client.invite}`);

		// Log out if script has been interrupted.
		process.on('SIGINT', async () => {
			console.log('Shutting down...');
			await client.destroy();
			process.exit(0);
		});
	},
};