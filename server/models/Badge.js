const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  icon: {
    type: String,
    required: true
  },
  requirement: {
    type: String,
    required: true
  },
  xpReward: {
    type: Number,
    default: 100
  }
});

module.exports = mongoose.model('Badge', badgeSchema);
