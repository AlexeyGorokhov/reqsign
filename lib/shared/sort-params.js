'use strict';

/**
 * Sort query parameters
 * @param {Object} data - Query parameters object
 * @return {Array<String>} - Array of sorted properties
 * @public
 */
module.exports = function (data) {
  const keys = Object.keys(data);
  return keys.sort();
};
