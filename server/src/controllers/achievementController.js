/**
 * Achievement Controller
 */
const Achievement = require('../models/Achievement');
const { BADGE_DEFINITIONS } = require('../config/constants');
const { checkAndAwardAchievements } = require('../services/achievementService');
const { successResponse } = require('../utils/apiResponse');

/**
 * Get all achievements (both unlocked and locked)
 */
const getAchievements = async (req, res, next) => {
  try {
    // Check if any pending achievements need to be awarded
    await checkAndAwardAchievements(req.user._id);

    const userAchievements = await Achievement.find({ user: req.user._id });
    const userMap = new Map();
    userAchievements.forEach((a) => {
      userMap.set(a.type, a);
    });

    const allBadges = BADGE_DEFINITIONS.map((def) => {
      const unlocked = userMap.get(def.type);
      return {
        type: def.type,
        name: def.name,
        description: def.description,
        icon: def.icon,
        isUnlocked: Boolean(unlocked),
        unlockedAt: unlocked ? unlocked.unlockedAt : null,
      };
    });

    const totalUnlocked = userAchievements.length;
    const totalBadges = BADGE_DEFINITIONS.length;

    return successResponse(
      res,
      {
        totalUnlocked,
        totalBadges,
        unlockedPercentage: Math.round((totalUnlocked / totalBadges) * 100),
        achievements: allBadges,
      },
      'Achievements retrieved.'
    );
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAchievements,
};
