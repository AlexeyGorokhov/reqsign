'use strict';

const request = require('request-promise');
const sign = require('../shared/sign');
const buildStringToSign = require('../shared/string-to-sign');

/**
 * Make `get` HTTP request
 * @param {String} url - Resource url
 * @param {Object} data - Query parameters object
 * @param {Object} config - Configuration object
 * @return {Promise<Object>} - Response data
 * @public
 */
module.exports = function (url, data, config) {
  return new Promise((resolve, reject) => {
    const timestamp = String(Date.now());
    const stringToSign = buildStringToSign('GET', data, timestamp);
    const signature = sign(stringToSign, config.key);
    const authHeader =
      `Signature timestamp=${timestamp} login=${config.login} signature=${signature}`;

    const reqOptions = {
      method: 'GET',
      uri: url,
      qs: data,
      headers: {
        Authorization: authHeader
      },
      json: true
    };

    request(reqOptions)
    .then(resBody => resolve(resBody))
    .catch(err => reject(err));
  });
};