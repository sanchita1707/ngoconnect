const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add an opportunity title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    trim: true
  },
  requiredSkills: {
    type: [String],
    default: []
  },
  location: {
    type: String,
    required: [true, 'Please add a location'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'Please add city'],
    trim: true
  },
  state: {
    type: String,
    required: [true, 'Please add state'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Please add a date']
  },
  startTime: {
    type: String,
    required: [true, 'Please add starting time']
  },
  endTime: {
    type: String,
    required: [true, 'Please add ending time']
  },
  volunteersNeeded: {
    type: Number,
    required: [true, 'Please specify the number of volunteers needed']
  },
  volunteersJoined: {
    type: Number,
    default: 0
  },
  image: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Draft', 'Open', 'Full', 'Completed', 'Cancelled'],
    default: 'Open'
  },
  urgency: {
    type: String,
    enum: ['Normal', 'Important', 'Urgent', 'Critical'],
    default: 'Normal'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Opportunity', opportunitySchema);
