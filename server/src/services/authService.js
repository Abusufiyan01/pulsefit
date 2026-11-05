/**
 * Authentication Service
 * Manages JWT generation, cookie setting, and refresh token validation
 */
const jwt = require('jsonwebtoken');

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

// 15 minutes in ms = 15 * 60 * 1000 = 900,000
const ACCESS_COOKIE_MAX_AGE = 15 * 60 * 1000;
// 7 days in ms = 7 * 24 * 60 * 60 * 1000 = 604,800,000
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

/**
 * Generate Access and Refresh JWTs
 * @param {string|mongoose.Types.ObjectId} userId 
 * @returns {{ accessToken: string, refreshToken: string }}
 */
const generateTokens = (userId) => {
  const accessSecret = process.env.JWT_ACCESS_SECRET || 'pulsefit_access_secret_fallback';
  const refreshSecret = process.env.JWT_REFRESH_SECRET || 'pulsefit_refresh_secret_fallback';

  const accessToken = jwt.sign({ id: userId.toString() }, accessSecret, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });

  const refreshToken = jwt.sign({ id: userId.toString() }, refreshSecret, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });

  return { accessToken, refreshToken };
};

/**
 * Set HTTP-Only cookies on the response object
 * @param {object} res Express response object
 * @param {string} accessToken 
 * @param {string} refreshToken 
 */
const setTokenCookies = (res, accessToken, refreshToken) => {
  const isProd = process.env.NODE_ENV === 'production';

  const baseCookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
  };

  if (accessToken) {
    res.cookie('accessToken', accessToken, {
      ...baseCookieOptions,
      maxAge: ACCESS_COOKIE_MAX_AGE,
    });
  }

  if (refreshToken) {
    res.cookie('refreshToken', refreshToken, {
      ...baseCookieOptions,
      maxAge: REFRESH_COOKIE_MAX_AGE,
    });
  }
};

/**
 * Clear authentication cookies
 * @param {object} res Express response object
 */
const clearTokenCookies = (res) => {
  const isProd = process.env.NODE_ENV === 'production';
  const options = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
  };

  res.clearCookie('accessToken', options);
  res.clearCookie('refreshToken', options);
};

/**
 * Verify Refresh Token
 * @param {string} token 
 * @returns {object} Decoded token payload
 */
const verifyRefreshToken = (token) => {
  const refreshSecret = process.env.JWT_REFRESH_SECRET || 'pulsefit_refresh_secret_fallback';
  return jwt.verify(token, refreshSecret);
};

module.exports = {
  generateTokens,
  setTokenCookies,
  clearTokenCookies,
  verifyRefreshToken,
  ACCESS_COOKIE_MAX_AGE,
  REFRESH_COOKIE_MAX_AGE,
};
