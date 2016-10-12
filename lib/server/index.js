'use strict';

const normalizeOptions = require('./normalize-options');
const getAuthData = require('./get-auth-data');
const getStringToSign = require('../shared/string-to-sign');
const sign = require('../shared/sign');
const debug = require('../shared/debug');

module.exports = function server (options) {
  const config = normalizeOptions(options);

  return function (req, res, next) {
    req.user = {
      isAuthenticated: false,
      timestamp: 0,
      login: '',
      signature: '',
      errorCode: null
    };

    getAuthData(req);

    if (req.user.errorCode) {
      next();
      return;
    }

    config.keyRetriever(req.user.login)
    .then(key => {
      if (!key) {
        debug.error('no key retrieved, login: ' + req.user.login);
        req.user.errorCode = 'NO_KEY';
        next();
        return;
      }

      config.replayAttackDefender(req.user.login, req.user.signature)
      .then(isOk => {
        if (!isOk) {
          debug.error('request has replayed');
          req.user.errorCode = 'REPLAYED';
          next();
          return;
        }

        if (!verifyTimestamp(req.user.timestamp, config.clockSkew)) {
          debug.error('user timestamp has expired');
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
          debug.error('wrong http request method, method: ' + req.method);
          req.user.errorCode = 'WRONG_REQUEST';
          next();
          return;
        }

        const stringToSign = getStringToSign(req.method, data, req.user.timestamp);
        const signature = sign(stringToSign, key);

        debug.log('make server signature, user timestamp: ' + req.user.timestamp);
        debug.log('server signature: ' + signature);
        debug.log('user signature: ' + req.user.signature);
        debug.log('signatures matched: ' + signature === req.user.signature);
        if (signature === req.user.signature) {
          req.user.isAuthenticated = true;
        } else {
          req.user.errorCode = 'WRONG_SIGNATURE';
        }

        next();
      })
      .catch(err => {
        debug.error('attack defender request error: ' + err.stack);
        next(err);
      });
    })
    .catch(err => {
      debug.error('retrieve key request error: ' + err.stack);
      next(err);
    });
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
