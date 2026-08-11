const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    trim: true
  },
  volunteersCount: {
    type: Number,
    default: 0
  },
  hours: {
    type: Number,
    default: 0
  },
  peopleImpacted: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Story', storySchema);
