const mongoose = require('mongoose');
const User = require('./user.model');

const trainerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  specialization: {
    type: [String],
    required: [true, 'Please provide your specialization areas']
  },
  experience: {
    type: Number,
    required: [true, 'Please provide your years of experience']
  },
  certifications: [{
    name: String,
    issuedBy: String,
    year: Number,
    documentUrl: String
  }],
  availability: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    startTime: String,
    endTime: String
  }],
  hourlyRate: {
    type: Number,
    required: [true, 'Please provide your hourly rate']
  },
  clients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  rating: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot be more than 500 characters']
  }
}, {
  timestamps: true
});

const Trainer = mongoose.model('Trainer', trainerSchema);

module.exports = Trainer;