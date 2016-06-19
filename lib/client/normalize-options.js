'use strict';

/**
 * Normalize options
 * @param {Object} options - Options object
 * @return {Object} - Normalized options object
 * @public
 */
module.exports = function (options) {
  if (!options) {
    throw new Error('Options are required');
  }
  if (!options.login || typeof options.login !== 'string') {
    throw new Error('Login option is required');
  }
  if (!options.key || typeof options.key !== 'string') {
    throw new Error('Key option is required');
  }
  return options;
};
