/**
 * WaterLog Mongoose Model
 */
const mongoose = require('mongoose');

const waterLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Water log must belong to a user'],
      index: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required for water log'],
      index: true,
    },
    glasses: {
      type: Number,
      default: 0,
      min: 0,
    },
    mlPerGlass: {
      type: Number,
      default: 250,
      min: 50,
    },
    totalMl: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

waterLogSchema.pre('save', function (next) {
  // If totalMl is not explicitly provided or glasses was modified, calculate totalMl
  if (this.isModified('glasses') || this.isModified('mlPerGlass') || !this.totalMl) {
    this.totalMl = (this.glasses || 0) * (this.mlPerGlass || 250);
  }
  next();
});

waterLogSchema.index({ user: 1, date: 1 }, { unique: true });

const WaterLog = mongoose.model('WaterLog', waterLogSchema);
module.exports = WaterLog;
