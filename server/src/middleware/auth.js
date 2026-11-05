/**
 * Authentication Middleware
 * Verifies JWT access token from Authorization header or cookies
 */
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { errorResponse } = require('../utils/apiResponse');

const auth = async (req, res, next) => {
  try {
    let token = null;

    // Check Authorization header (Bearer <token>)
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      // Check cookies
      token = req.cookies.accessToken;
    }

    if (!token) {
      return errorResponse(res, 'Access denied. No authentication token provided.', 401);
    }

    const accessSecret = process.env.JWT_ACCESS_SECRET || 'pulsefit_access_secret_fallback';
    const decoded = jwt.verify(token, accessSecret);

    // Find user in database
    const user = await User.findById(decoded.id);
    if (!user) {
      return errorResponse(res, 'User session invalid. Account may have been removed.', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token has expired. Please refresh your session.', 401);
    }
    if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, 'Invalid authentication token.', 401);
    }
    return errorResponse(res, 'Authentication failed.', 401);
  }
};

module.exports = auth;
