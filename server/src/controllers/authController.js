/**
 * Auth Controller
 */
const crypto = require('crypto');
const User = require('../models/User');
const { generateTokens, setTokenCookies, clearTokenCookies, verifyRefreshToken } = require('../services/authService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Register a new user
 */
const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      age,
      gender,
      height,
      weight,
      goal,
      experienceLevel,
      workoutDaysPerWeek,
      unitPreference,
      availableEquipment,
    } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return errorResponse(res, 'An account with this email address already exists.', 400);
    }

    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      age: age || 25,
      gender: gender || 'male',
      height: height || 175,
      weight: weight || 70,
      goal: goal || 'build_muscle',
      experienceLevel: experienceLevel || 'intermediate',
      workoutDaysPerWeek: workoutDaysPerWeek || 4,
      unitPreference: unitPreference || 'metric',
      availableEquipment: availableEquipment || ['barbell', 'dumbbell', 'bodyweight'],
      isOnboardingComplete: Boolean(height && weight && goal),
    });

    user.recalculateFitnessMetrics();
    await user.save();

    const { accessToken, refreshToken } = generateTokens(user._id);

    // Save refresh token reference
    user.refreshToken = refreshToken;
    await user.save();

    setTokenCookies(res, accessToken, refreshToken);

    const userSafe = user.toObject();
    delete userSafe.password;
    delete userSafe.refreshToken;

    return successResponse(
      res,
      {
        user: userSafe,
        tokens: {
          accessToken,
          refreshToken,
        },
      },
      'User registered successfully.',
      201
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Login user
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Email and password are required.', 400);
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return errorResponse(res, 'Invalid email or password.', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid email or password.', 401);
    }

    const { accessToken, refreshToken } = generateTokens(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    setTokenCookies(res, accessToken, refreshToken);

    const userSafe = user.toObject();
    delete userSafe.password;
    delete userSafe.refreshToken;

    return successResponse(
      res,
      {
        user: userSafe,
        tokens: {
          accessToken,
          refreshToken,
        },
      },
      'Logged in successfully.'
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Logout user
 */
const logout = async (req, res, next) => {
  try {
    if (req.user) {
      req.user.refreshToken = null;
      await req.user.save();
    }
    clearTokenCookies(res);
    return successResponse(res, null, 'Logged out successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * Refresh access token
 */
const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!refreshToken) {
      return errorResponse(res, 'Refresh token is required.', 401);
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (_err) {
      return errorResponse(res, 'Invalid or expired refresh token. Please log in again.', 401);
    }

    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user) {
      return errorResponse(res, 'User not found.', 401);
    }

    const tokens = generateTokens(user._id);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    setTokenCookies(res, tokens.accessToken, tokens.refreshToken);

    return successResponse(
      res,
      {
        tokens,
      },
      'Tokens refreshed successfully.'
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Forgot password - generates reset token
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return errorResponse(res, 'Email address is required.', 400);
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Return 200 to prevent email enumeration
      return successResponse(
        res,
        null,
        'If an account with that email exists, password reset instructions have been sent.'
      );
    }

    // Generate random reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpiry = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

    console.log('--------------------------------------------------');
    console.log(`[PASSWORD RESET REQUEST] for user: ${user.email}`);
    console.log(`Reset Token: ${resetToken}`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log('--------------------------------------------------');

    return successResponse(
      res,
      {
        resetUrl: process.env.NODE_ENV === 'development' ? resetUrl : undefined,
      },
      'Password reset instructions sent. Please check your email or console in development.'
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Reset password
 */
const resetPassword = async (req, res, next) => {
  try {
    const token = req.params.token || req.body.token;
    const { password } = req.body;

    if (!token || !password) {
      return errorResponse(res, 'Reset token and new password are required.', 400);
    }

    if (password.length < 6) {
      return errorResponse(res, 'Password must be at least 6 characters.', 400);
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return errorResponse(res, 'Invalid or expired password reset token.', 400);
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    user.refreshToken = undefined;
    await user.save();

    clearTokenCookies(res);

    return successResponse(res, null, 'Password reset successful. Please log in with your new password.');
  } catch (err) {
    next(err);
  }
};

/**
 * Get current authenticated user
 */
const getMe = async (req, res, next) => {
  try {
    const userSafe = req.user.toObject();
    delete userSafe.password;
    delete userSafe.refreshToken;

    return successResponse(res, userSafe, 'User profile retrieved.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  logout,
  refresh,
  forgotPassword,
  resetPassword,
  getMe,
};
