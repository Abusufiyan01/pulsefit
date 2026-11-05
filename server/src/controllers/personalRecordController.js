/**
 * Personal Record Controller
 */
const PersonalRecord = require('../models/PersonalRecord');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Get all personal records for current user
 */
const getPersonalRecords = async (req, res, next) => {
  try {
    const prs = await PersonalRecord.find({ user: req.user._id })
      .sort({ exerciseName: 1, achievedAt: -1 })
      .populate('workoutId', 'title startTime');

    // Group PRs by exercise
    const grouped = {};
    prs.forEach((pr) => {
      const exId = pr.exerciseId.toString();
      if (!grouped[exId]) {
        grouped[exId] = {
          exerciseId: pr.exerciseId,
          exerciseName: pr.exerciseName,
          records: {},
        };
      }
      if (!grouped[exId].records[pr.type] || grouped[exId].records[pr.type].value < pr.value) {
        grouped[exId].records[pr.type] = pr;
      }
    });

    return successResponse(
      res,
      {
        total: prs.length,
        groupedByExercise: Object.values(grouped),
        allRecords: prs,
      },
      'Personal records retrieved.'
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Get PR history for a specific exercise
 */
const getPersonalRecordsByExercise = async (req, res, next) => {
  try {
    const { exerciseId } = req.params;

    const prs = await PersonalRecord.find({
      user: req.user._id,
      exerciseId,
    })
      .sort({ achievedAt: -1 })
      .populate('workoutId', 'title startTime');

    return successResponse(res, prs, `Retrieved ${prs.length} personal record(s) for exercise.`);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPersonalRecords,
  getPersonalRecordsByExercise,
};
