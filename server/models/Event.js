const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add an event title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Please add date']
  },
  startTime: {
    type: String,
    required: [true, 'Please add starting time']
  },
  endTime: {
    type: String,
    required: [true, 'Please add ending time']
  },
  location: {
    type: String,
    required: [true, 'Please add location'],
    trim: true
  },
  capacity: {
    type: Number,
    required: [true, 'Please add event capacity']
  },
  attendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);
