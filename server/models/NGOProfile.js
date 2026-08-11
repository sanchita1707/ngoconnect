const mongoose = require('mongoose');

const ngoProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  organizationName: {
    type: String,
    required: [true, 'Please add the organization name'],
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  registrationNumber: {
    type: String,
    required: [true, 'Please add registration number'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add organization email'],
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  logo: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    required: [true, 'Please specify the city'],
    trim: true
  },
  state: {
    type: String,
    required: [true, 'Please specify the state'],
    trim: true
  },
  causes: {
    type: [String],
    default: []
  },
  verificationStatus: {
    type: String,
    enum: ['Pending', 'Verified', 'Rejected'],
    default: 'Pending'
  },
  trustScore: {
    type: Number,
    default: 0
  },
  foundedYear: {
    type: Number
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('NGOProfile', ngoProfileSchema);
