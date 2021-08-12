module.exports = {
	name: 'prefix',
	description: "Shows bot's prefix",
	async execute(msg, args, client) {
		msg.channel.send(`**My prefix here is \`${client.guildSettings[msg.guild.id].prefix}\`**`);
	},
};