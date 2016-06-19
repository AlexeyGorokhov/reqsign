'use strict';

const normalizeOptions = require('./normalize-options');
const get = require('./get.js');
const post = require('./post.js');

/**
 * Client factory
 * @param {Object} options - Configuration options
 * @return {Object}
 * @public
 */
module.exports = function client (options) {
  const config = normalizeOptions(options);

  return {
    get: function (url, data) {
      return get(url, data, config);
    },
    post: function (url, data) {
      return post(url, data, config);
    }
  };
};
