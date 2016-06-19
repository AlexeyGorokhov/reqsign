'use strict';

const request = require('request-promise');
const buildStringToSign = require('../shared/string-to-sign');
const sign = require('../shared/sign');

/**
 * Make `post` HTTP request
 * @param {String} url - Resource url
 * @param {Object} data - Body data object
 * @param {Object} config - Configuration object
 * @return {Promise<Object>} - Response data
 * @public
 */
module.exports = function (url, data, config) {
  return new Promise((resolve, reject) => {
    const timestamp = String(Date.now());
    const stringToSign = buildStringToSign('POST', data, timestamp);
    const signature = sign(stringToSign, config.key);
    const authHeader =
      `Signature timestamp=${timestamp} login=${config.login} signature=${signature}`;

    const reqOptions = {
      method: 'POST',
      uri: url,
      body: data,
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