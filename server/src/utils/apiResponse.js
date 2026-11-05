/**
 * Standardized API Response Helper
 */

/**
 * Return a successful JSON response
 * @param {object} res Express response object
 * @param {any} data Response payload
 * @param {string} message Human readable success message
 * @param {number} statusCode HTTP status code (default 200)
 */
const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Return an error JSON response
 * @param {object} res Express response object
 * @param {string} message Error message
 * @param {number} statusCode HTTP status code (default 500)
 * @param {any} errors Specific validation or detailed error info
 */
const errorResponse = (res, message = 'Internal Server Error', statusCode = 500, errors = null) => {
  const payload = {
    success: false,
    message,
  };

  if (errors !== null && errors !== undefined) {
    payload.errors = errors;
  }

  return res.status(statusCode).json(payload);
};

/**
 * Return a paginated JSON response
 * @param {object} res Express response object
 * @param {Array} items Array of items for current page
 * @param {number} page Current page index (1-based)
 * @param {number} limit Items per page
 * @param {number} total Total count of records
 * @param {string} message Success message
 */
const paginatedResponse = (res, items = [], page = 1, limit = 20, total = 0, message = 'Success') => {
  const totalPages = Math.ceil(total / limit) || 1;
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return res.status(200).json({
    success: true,
    message,
    data: items,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages,
      hasNextPage,
      hasPrevPage,
    },
  });
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse,
};
