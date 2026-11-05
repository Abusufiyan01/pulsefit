/**
 * BodyMetric Mongoose Model
 */
const mongoose = require('mongoose');

const bodyMetricSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Body metric must belong to a user'],
      index: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required for body metric'],
      index: true,
    },
    weight: {
      type: Number,
      required: [true, 'Weight is required'],
      min: [20, 'Weight must be at least 20 kg'],
      max: [400, 'Weight cannot exceed 400 kg'],
    },
    bodyFat: {
      type: Number,
      min: [2, 'Body fat must be at least 2%'],
      max: [70, 'Body fat cannot exceed 70%'],
    },
    measurements: {
      chest: { type: Number, min: 0 },
      waist: { type: Number, min: 0 },
      hips: { type: Number, min: 0 },
      leftArm: { type: Number, min: 0 },
      rightArm: { type: Number, min: 0 },
      leftThigh: { type: Number, min: 0 },
      rightThigh: { type: Number, min: 0 },
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

bodyMetricSchema.index({ user: 1, date: -1 });

const BodyMetric = mongoose.model('BodyMetric', bodyMetricSchema);
module.exports = BodyMetric;
