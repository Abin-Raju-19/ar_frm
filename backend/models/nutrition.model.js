const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide food item name']
  },
  calories: Number,
  protein: Number, // in grams
  carbs: Number, // in grams
  fat: Number, // in grams
  fiber: Number, // in grams
  sugar: Number, // in grams
  servingSize: String,
  quantity: {
    type: Number,
    default: 1
  }
});

const mealSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide meal name'],
    enum: ['breakfast', 'lunch', 'dinner', 'snack', 'other']
  },
  time: Date,
  foodItems: [foodItemSchema],
  notes: String,
  totalCalories: Number,
  totalProtein: Number,
  totalCarbs: Number,
  totalFat: Number
});

const nutritionLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  meals: [mealSchema],
  waterIntake: Number, // in liters
  dailyGoal: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    water: Number
  },
  notes: String
}, {
  timestamps: true
});

// Virtual for calculating daily totals
nutritionLogSchema.virtual('dailyTotals').get(function() {
  const totals = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  };
  
  this.meals.forEach(meal => {
    totals.calories += meal.totalCalories || 0;
    totals.protein += meal.totalProtein || 0;
    totals.carbs += meal.totalCarbs || 0;
    totals.fat += meal.totalFat || 0;
  });
  
  return totals;
});

// Meal plan schema for creating nutrition plans
const mealPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide meal plan name']
  },
  description: String,
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetCalories: Number,
  targetProtein: Number,
  targetCarbs: Number,
  targetFat: Number,
  meals: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack', 'other']
    },
    foodItems: [foodItemSchema]
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [String], // e.g., 'low-carb', 'high-protein', 'vegetarian'
  duration: Number // in days
}, {
  timestamps: true
});

const NutritionLog = mongoose.model('NutritionLog', nutritionLogSchema);
const MealPlan = mongoose.model('MealPlan', mealPlanSchema);

module.exports = { NutritionLog, MealPlan };