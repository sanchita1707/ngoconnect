const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  reviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  revieweeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  opportunityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity'
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Review', reviewSchema);
