const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a campaign title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    trim: true
  },
  goal: {
    type: String,
    required: [true, 'Please add a goal description'],
    trim: true
  },
  startDate: {
    type: Date,
    required: [true, 'Please specify start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Please specify end date']
  },
  status: {
    type: String,
    enum: ['Active', 'Completed', 'Cancelled'],
    default: 'Active'
  },
  image: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Campaign', campaignSchema);
