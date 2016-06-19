'use strict';

const crypto = require('crypto');

/**
 * Sign string
 * @param {String} str - String to sign
 * @param {String} key - Secret key
 * @return {String}
 */
module.exports = function (str, key) {
  return crypto.createHmac('sha256', key).update(str).digest('base64');
};
