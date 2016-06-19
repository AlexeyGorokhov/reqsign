'use strict';

const md5 = require('md5');
const sortParams = require('./sort-params');

/**
 * Build string to be signed
 * @param {String} method - HTTP verb
 * @param {Object} data - Parameters object
 * @param {String} timestamp
 * @return {String}
 * @public
 */
module.exports = function (method, data, timestamp) {
  if (method === 'GET') {
    let stringToSign = `${timestamp}\n`;
    sortParams(data).forEach(p => {
      stringToSign += `${encodeURIComponent(p)}=${encodeURIComponent(data[p])}&`;
    });
    return stringToSign.slice(0, -1);
  }

  if (method === 'POST') {
    const stringToSign = `${timestamp}\n${md5(JSON.stringify(data))}`;
    return stringToSign;
  }

  throw new Error(`HTTP method ${method} is not supported`);
};
