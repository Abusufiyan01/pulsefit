/**
 * Food Mongoose Model
 */
const mongoose = require('mongoose');
const { FOOD_CATEGORIES } = require('../config/constants');

const foodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Food name is required'],
      trim: true,
    },
    brand: {
      type: String,
      default: 'Generic',
      trim: true,
    },
    category: {
      type: String,
      enum: FOOD_CATEGORIES,
      default: 'Snack',
    },
    calories: {
      type: Number,
      required: [true, 'Calories is required'],
      min: [0, 'Calories cannot be negative'],
    },
    protein: {
      type: Number,
      required: [true, 'Protein is required'],
      min: [0, 'Protein cannot be negative'],
    },
    carbs: {
      type: Number,
      required: [true, 'Carbohydrates is required'],
      min: [0, 'Carbohydrates cannot be negative'],
    },
    fat: {
      type: Number,
      required: [true, 'Fat is required'],
      min: [0, 'Fat cannot be negative'],
    },
    fiber: {
      type: Number,
      default: 0,
      min: 0,
    },
    sugar: {
      type: Number,
      default: 0,
      min: 0,
    },
    servingSize: {
      type: Number,
      default: 100,
      min: 0,
    },
    servingUnit: {
      type: String,
      default: 'g',
      trim: true,
    },
    isCustom: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

foodSchema.index({ name: 'text', brand: 'text' });
foodSchema.index({ category: 1 });
foodSchema.index({ isCustom: 1, createdBy: 1 });

const Food = mongoose.model('Food', foodSchema);
module.exports = Food;
