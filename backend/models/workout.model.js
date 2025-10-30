const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide exercise name']
  },
  type: {
    type: String,
    enum: ['strength', 'cardio', 'flexibility', 'balance', 'other'],
    required: [true, 'Please provide exercise type']
  },
  sets: Number,
  reps: Number,
  duration: Number, // in minutes
  distance: Number, // in km or miles
  weight: Number, // in kg or lbs
  notes: String
});

const workoutSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please provide workout name']
  },
  description: String,
  exercises: [exerciseSchema],
  duration: Number, // total duration in minutes
  caloriesBurned: Number,
  date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['planned', 'completed', 'skipped'],
    default: 'planned'
  },
  trainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trainer'
  },
  workoutPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkoutPlan'
  }
}, {
  timestamps: true
});

// Virtual for calculating total sets, reps, etc.
workoutSchema.virtual('totalSets').get(function() {
  return this.exercises.reduce((total, exercise) => total + (exercise.sets || 0), 0);
});

workoutSchema.virtual('totalReps').get(function() {
  return this.exercises.reduce((total, exercise) => total + (exercise.reps || 0) * (exercise.sets || 1), 0);
});

// Workout plan schema for creating workout routines
const workoutPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide workout plan name']
  },
  description: String,
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetMuscleGroups: [String],
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  duration: Number, // in weeks
  schedule: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    workouts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workout'
    }]
  }],
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Workout = mongoose.model('Workout', workoutSchema);
const WorkoutPlan = mongoose.model('WorkoutPlan', workoutPlanSchema);

module.exports = { Workout, WorkoutPlan };