const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  trainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trainer',
    required: true
  },
  date: {
    type: Date,
    required: [true, 'Please provide appointment date']
  },
  startTime: {
    type: String,
    required: [true, 'Please provide start time']
  },
  endTime: {
    type: String,
    required: [true, 'Please provide end time']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  type: {
    type: String,
    enum: ['consultation', 'training', 'assessment', 'other'],
    required: [true, 'Please provide appointment type']
  },
  location: {
    type: String,
    enum: ['gym', 'online', 'home', 'other'],
    required: [true, 'Please provide appointment location']
  },
  price: {
    type: Number,
    default: 0
  },
  notes: String,
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  reminder: {
    isSet: {
      type: Boolean,
      default: true
    },
    time: {
      type: Number, // minutes before appointment
      default: 60
    }
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    submittedAt: Date
  }
}, {
  timestamps: true
});

// Virtual for calculating duration
appointmentSchema.virtual('duration').get(function() {
  // This is a simplified calculation and might need adjustment based on time format
  const startHour = parseInt(this.startTime.split(':')[0]);
  const startMinute = parseInt(this.startTime.split(':')[1]);
  const endHour = parseInt(this.endTime.split(':')[0]);
  const endMinute = parseInt(this.endTime.split(':')[1]);
  
  return (endHour - startHour) * 60 + (endMinute - startMinute);
});

// Index for efficient querying
appointmentSchema.index({ user: 1, date: 1 });
appointmentSchema.index({ trainer: 1, date: 1 });
appointmentSchema.index({ status: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;