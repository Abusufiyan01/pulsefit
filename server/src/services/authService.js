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

const getAccessSecret = () => {
  const secret =
    process.env.JWT_ACCESS_SECRET ||
    (process.env.NODE_ENV === 'test' ? 'test-only-secret' : undefined);
  if (!secret) throw new Error('JWT_ACCESS_SECRET is not set');
  return secret;
};

const getRefreshSecret = () => {
  const secret =
    process.env.JWT_REFRESH_SECRET ||
    (process.env.NODE_ENV === 'test' ? 'test-only-secret' : undefined);
  if (!secret) throw new Error('JWT_REFRESH_SECRET is not set');
  return secret;
};

/**
 * Generate Access and Refresh JWTs
 * @param {string|mongoose.Types.ObjectId} userId 
 * @returns {{ accessToken: string, refreshToken: string }}
 */
const generateTokens = (userId) => {
  const accessSecret = getAccessSecret();
  const refreshSecret = getRefreshSecret();

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
  const isSecure =
    process.env.COOKIE_SECURE === 'true' ||
    (isProd && process.env.CLIENT_URL?.startsWith('https'));

  const baseCookieOptions = {
    httpOnly: true,
    secure: isSecure,
    sameSite: isSecure ? 'none' : 'lax',
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
  const isSecure =
    process.env.COOKIE_SECURE === 'true' ||
    (isProd && process.env.CLIENT_URL?.startsWith('https'));

  const options = {
    httpOnly: true,
    secure: isSecure,
    sameSite: isSecure ? 'none' : 'lax',
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
  const refreshSecret = getRefreshSecret();
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
