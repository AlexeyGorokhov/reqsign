'use strict';

const normalizeOptions = require('./normalize-options');
const getAuthData = require('./get-auth-data');
const getStringToSign = require('../shared/string-to-sign');
const sign = require('../shared/sign');
const debug = require('debug');
const log = debug('request:log');
const error = debug('request:error');

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

    log('retrieve key, login: ' + req.user.login);
    config.keyRetriever(req.user.login)
    .then(key => {
      if (!key) {
        error('NO_KEY, login: ' + req.user.login);
        req.user.errorCode = 'NO_KEY';
        next();
        return;
      }

      log('receive key: ' + key);
      log('attack defender, signature: ' + req.user.signature);
      config.replayAttackDefender(req.user.login, req.user.signature)
      .then(isOk => {
        if (!isOk) {
          error('REPLAYED');
          req.user.errorCode = 'REPLAYED';
          next();
          return;
        }

        if (!verifyTimestamp(req.user.timestamp, config.clockSkew)) {
          error('EXPIRED');
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
          error('WRONG_REQUEST, ' + req.method);
          req.user.errorCode = 'WRONG_REQUEST';
          next();
          return;
        }

        const stringToSign = getStringToSign(req.method, data, req.user.timestamp);
        const signature = sign(stringToSign, key);

        log('data: ', data);
        log('timestamp: ' + req.user.timestamp);
        log('stringToSign: ' + stringToSign);
        log('signature: ' + signature);
        log('req.user.signature: ' + req.user.signature);
        if (signature === req.user.signature) {
          req.user.isAuthenticated = true;
        } else {
          req.user.errorCode = 'WRONG_SIGNATURE';
        }
        log('req.user: ', req.user);

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
