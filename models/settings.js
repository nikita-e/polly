const mongoose = require('mongoose');
const { defaultPrefix } = require('../config.json');

const settingsSchema = mongoose.Schema({
  // Guild ID
  _id: {
    type: String,
    required: true,
  },

  prefix: {
    type: String,
    default: defaultPrefix,
  },

  pingRoles: {
    type: Array,
    default: []
  }
});

module.exports = mongoose.model('guild-settings', settingsSchema);