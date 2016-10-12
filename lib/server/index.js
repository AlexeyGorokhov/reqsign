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
      signature: '',
      errorCode: null
    };

    getAuthData(req);

    if (req.user.errorCode) {
      next();
      return;
    }

    debug('Log: retrieve key request, login: ' + req.user.login);
    config.keyRetriever(req.user.login)
    .then(key => {
      if (!key) {
        debug('Error: no key retrieved, login: ' + req.user.login);
        req.user.errorCode = 'NO_KEY';
        next();
        return;
      }

      debug('Log: receive key: ' + key);
      debug('Log: attack defender request, signature: ' + req.user.signature);
      config.replayAttackDefender(req.user.login, req.user.signature)
      .then(isOk => {
        if (!isOk) {
          debug('Error: key has replayed');
          req.user.errorCode = 'REPLAYED';
          next();
          return;
        }

        if (!verifyTimestamp(req.user.timestamp, config.clockSkew)) {
          debug('Error: key has expired');
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
          debug('Error: wrong http request, request: ' + req.method);
          req.user.errorCode = 'WRONG_REQUEST';
          next();
          return;
        }

        const stringToSign = getStringToSign(req.method, data, req.user.timestamp);
        const signature = sign(stringToSign, key);

        debug('Log: make signature, data: ' + JSON.stringify(data));
        debug('Log: make signature, timestamp: ' + req.user.timestamp);
        debug('Log: server signature: ' + signature);
        debug('Log: user signature: ' + req.user.signature);
        debug('Log: signatures matched: ' + signature === req.user.signature);
        if (signature === req.user.signature) {
          req.user.isAuthenticated = true;
        } else {
          req.user.errorCode = 'WRONG_SIGNATURE';
        }

        next();
      })
      .catch(err => {
        debug('Error: attack defender request error: ' + JSON.stringify(err));
        next(err);
      });
    })
    .catch(err => {
      debug('Error: retrieve key request error: ' + JSON.stringify(err));
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
