const mongoose = require('mongoose');

const volunteerProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  bio: {
    type: String,
    default: '',
    trim: true
  },
  skills: {
    type: [String],
    default: []
  },
  interests: {
    type: [String],
    default: []
  },
  preferredCauses: {
    type: [String],
    default: []
  },
  experience: {
    type: String,
    default: '',
    trim: true
  },
  availability: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  city: {
    type: String,
    default: '',
    trim: true
  },
  state: {
    type: String,
    default: '',
    trim: true
  },
  country: {
    type: String,
    default: '',
    trim: true
  },
  volunteerHours: {
    type: Number,
    default: 0
  },
  impactScore: {
    type: Number,
    default: 0
  },
  xp: {
    type: Number,
    default: 0
  },
  level: {
    type: String,
    default: 'Newcomer'
  },
  badges: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Badge'
  }],
  savedOpportunities: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity'
  }],
  profileCompletion: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('VolunteerProfile', volunteerProfileSchema);
