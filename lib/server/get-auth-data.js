'use strict';
/**
 * Retrieve data from Authorization HTTP header
 * @param {Object} req - Request object
 * @public
 */
module.exports = function (req) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return setErrorCode(req);
  }

  const parts = authHeader.split(' ').filter(x => {
    if (x) return true;
    return false;
  });

  if (parts[0].toLowerCase() !== 'signature') {
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
