const mongoose = require('mongoose');

const pollSchema = mongoose.Schema({
  // Message ID
  _id: {
    type: String,
    required: true,
  },

  channelId: {
    type: String,
    required: true,
  },

  authorId: {
    type: String,
    required: true,
  },

  closeAt: {
    type: Date,
    required: true,
  },

  closed: {
    type: Boolean,
    default: false
  },

  anonymous: {
    type: Boolean,
    default: false
  },

  multiple: {
    type: Boolean,
    default: false
  },

  embed: {
    type: {},
    required: true,
  },

  buttons: {
    type: Array,
    required: true,
  },

  votes: {
    type: Array,
    required: true,
  },
});

module.exports = mongoose.model('polls', pollSchema);