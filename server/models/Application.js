const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  opportunityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity',
    required: true
  },
  volunteerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Application', applicationSchema);
