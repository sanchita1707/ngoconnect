const mongoose = require('mongoose');

const contributorSchema = new mongoose.Schema({
  volunteerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const resourceNeedSchema = new mongoose.Schema({
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a resource title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a resource description'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Please add a resource category'],
    trim: true
  },
  quantityRequired: {
    type: Number,
    required: [true, 'Please specify quantity required']
  },
  quantityReceived: {
    type: Number,
    default: 0
  },
  unit: {
    type: String,
    required: [true, 'Please specify unit (e.g. pieces, kg, boxes)'],
    trim: true
  },
  urgency: {
    type: String,
    enum: ['Normal', 'Important', 'Urgent', 'Critical'],
    default: 'Normal'
  },
  location: {
    type: String,
    trim: true
  },
  requiredBy: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Open', 'Partially Fulfilled', 'Fulfilled', 'Closed'],
    default: 'Open'
  },
  contributors: [contributorSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('ResourceNeed', resourceNeedSchema);
