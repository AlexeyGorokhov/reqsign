'use strict';

const normalizeOptions = require('./normalize-options');
const getAuthData = require('./get-auth-data');
const getStringToSign = require('../shared/string-to-sign');
const sign = require('../shared/sign');
const debug = require('debug')('reqsign');

module.exports = function server (options) {
  const config = normalizeOptions(options);

  return function (req, res, next) {
    req.user = {
      isAuthenticated: false,
      timestamp: 0,
      login: '',
      roles: [],
      signature: '',
      errorCode: null
    };

    getAuthData(req);

    if (req.user.errorCode) {
      next();
      return;
    }

    config.keyRetriever(req.user.login)
    .then(result => {
      if (!result) {
        req.user.errorCode = 'NO_KEY';
        next();
        return;
      }

      let key;

      if (typeof result === 'object') {
        key = result.key;
        req.user.roles = result.roles;
      } else {
        key = result;
      }

      config.replayAttackDefender(req.user.login, req.user.signature)
      .then(isOk => {
        if (!isOk) {
          req.user.errorCode = 'REPLAYED';
          next();
          return;
        }

        if (!verifyTimestamp(req.user.timestamp, config.clockSkew)) {
          req.user.errorCode = 'EXPIRED';
          next();
          return;
        }

        let data;
        if (req.method === 'GET') {
          data = req.query;
        } else if (req.method === 'POST') {
          data = req.body;
        } else {
          req.user.errorCode = 'WRONG_REQUEST';
          next();
          return;
        }

        const stringToSign = getStringToSign(req.method, data, req.user.timestamp);
        const signature = sign(stringToSign, key);

        debug(`Received signature: ${req.user.signature}`);
        debug(`Server-built string-to-sign: ${stringToSign}`);
        debug(`Server-built signature: ${signature}`);
        debug(`Are signatures equal: ${signature === req.user.signature}`);

        if (signature === req.user.signature) {
          req.user.isAuthenticated = true;
        } else {
          req.user.errorCode = 'WRONG_SIGNATURE';
        }

        next();
      })
      .catch(err => next(err));
    })
    .catch(err => next(err));
  };
};

/**
 * Verify timestamp
 * @param {String} requestTimestamp - Timestamp from Authorization header
 * @param {Int} clockSkew - Configured clock skew
 * @return {Boolean}
 * @private
 */
function verifyTimestamp (requestTimestamp, clockSkew) {
  const reqTs = parseInt(requestTimestamp, 10);
  const curTs = Date.now();
  const bottom = curTs - clockSkew * 1000;
  const top = curTs + clockSkew * 1000;

  return reqTs <= top && reqTs >= bottom;
}
