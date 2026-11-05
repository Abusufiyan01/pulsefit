/**
 * FoodLog Mongoose Model
 */
const mongoose = require('mongoose');
const { MEAL_TYPES } = require('../config/constants');

const loggedFoodItemSchema = new mongoose.Schema(
  {
    foodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Food',
    },
    foodName: {
      type: String,
      required: [true, 'Food name is required'],
    },
    servings: {
      type: Number,
      default: 1,
      min: [0.01, 'Servings must be positive'],
    },
    calories: {
      type: Number,
      required: true,
      min: 0,
    },
    protein: {
      type: Number,
      required: true,
      min: 0,
    },
    carbs: {
      type: Number,
      required: true,
      min: 0,
    },
    fat: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: true }
);

const foodLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Food log must belong to a user'],
      index: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required for food log'],
      index: true,
    },
    meal: {
      type: String,
      enum: MEAL_TYPES,
      required: [true, 'Meal category is required'],
    },
    foods: [loggedFoodItemSchema],
    totalCalories: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalProtein: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalCarbs: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalFat: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to calculate meal totals
foodLogSchema.pre('save', function (next) {
  if (this.foods && this.foods.length > 0) {
    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;

    this.foods.forEach((item) => {
      calories += (Number(item.calories) || 0) * (Number(item.servings) || 1);
      protein += (Number(item.protein) || 0) * (Number(item.servings) || 1);
      carbs += (Number(item.carbs) || 0) * (Number(item.servings) || 1);
      fat += (Number(item.fat) || 0) * (Number(item.servings) || 1);
    });

    this.totalCalories = Math.round(calories);
    this.totalProtein = Math.round(protein * 10) / 10;
    this.totalCarbs = Math.round(carbs * 10) / 10;
    this.totalFat = Math.round(fat * 10) / 10;
  }
  next();
});

foodLogSchema.index({ user: 1, date: -1, meal: 1 });

const FoodLog = mongoose.model('FoodLog', foodLogSchema);
module.exports = FoodLog;
