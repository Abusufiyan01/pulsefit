/**
 * In-memory Cache Service using node-cache
 */
const NodeCache = require('node-cache');

// Standard TTL 10 minutes (600 seconds), check period 120 seconds
const cache = new NodeCache({
  stdTTL: 600,
  checkperiod: 120,
  useClones: false,
});

/**
 * Get item from cache
 * @param {string} key 
 */
const get = (key) => {
  return cache.get(key);
};

/**
 * Set item in cache with optional TTL in seconds
 * @param {string} key 
 * @param {any} value 
 * @param {number} ttlSeconds 
 */
const set = (key, value, ttlSeconds) => {
  if (ttlSeconds !== undefined) {
    return cache.set(key, value, ttlSeconds);
  }
  return cache.set(key, value);
};

/**
 * Delete item from cache
 * @param {string} key 
 */
const del = (key) => {
  return cache.del(key);
};

/**
 * Flush all cache items
 */
const flush = () => {
  return cache.flushAll();
};

module.exports = {
  cache,
  get,
  set,
  del,
  flush,
};
