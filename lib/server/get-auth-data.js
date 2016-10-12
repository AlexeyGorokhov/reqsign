'use strict';
const debug = require('debug')('reqsign');
/**
 * Retrieve data from Authorization HTTP header
 * @param {Object} req - Request object
 * @public
 */
module.exports = function (req) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    debug('Error: authorization header is not present');
    return setErrorCode(req);
  }

  const parts = authHeader.split(' ').filter(x => {
    if (x) return true;
    return false;
  });

  if (parts[0].toLowerCase() !== 'signature') {
    debug('Error: authorization header is not valid. "signature" is not present');
    return setErrorCode(req);
  }

  parts.forEach(part => {
    if (part.indexOf('timestamp') === 0) {
      req.user.timestamp = part.split('timestamp=')[1];
      return;
    }
    if (part.indexOf('login') === 0) {
      req.user.login = part.split('login=')[1];
      return;
    }
    if (part.indexOf('signature') === 0) {
      req.user.signature = part.split('signature=')[1];
    }
  });

  if (!req.user.timestamp || !req.user.login || !req.user.signature) {
    if (!req.user.timestamp) debug('Error: authorization header is not valid. "timestamp" is not present');
    if (!req.user.login) debug('Error: authorization header is not valid. "login" is not present');
    if (!req.user.signature) debug('Error: authorization header is not valid. "signature" is not present');
    return setErrorCode(req);
  }
};

/**
 * Set error code of wrong request
 * @param {Object} req - Request object
 * @private
 */
function setErrorCode (req) {
  req.user.errorCode = 'WRONG_REQUEST';
}
