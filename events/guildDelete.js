const mongo = require('../modules/mongo');
const settingsModel = require('../models/settings');

module.exports = {
    name: 'guildDelete',
    async execute(guild, client) {
        await mongo().then(async mongoose => {
            try {
                // Delete record from DB.
                await settingsModel.findOneAndDelete(
                    {
                        _id: guild.id
                    }
                );

                delete client.guildSettings[guild.id];
            } catch (e) {
                console.error(e);
            }
        });
    },
};