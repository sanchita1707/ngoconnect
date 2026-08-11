const mongoose = require('mongoose');

const participationSchema = new mongoose.Schema({
  volunteerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  opportunityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity',
    required: true
  },
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hours: {
    type: Number,
    required: [true, 'Please specify hours worked']
  },
  activityDate: {
    type: Date,
    default: Date.now
  },
  feedback: {
    type: String,
    trim: true
  },
  peopleImpacted: {
    type: Number,
    default: 0
  },
  verifiedByNGO: {
    type: Boolean,
    default: false
  },
  certificateId: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Participation', participationSchema);
