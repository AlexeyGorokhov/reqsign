'use strict';

const normalizeOptions = require('./normalize-options');
const getAuthData = require('./get-auth-data');

module.exports = function server (options) {
  const config = normalizeOptions(options);

  return function (req, res, next) {
    req.user = {
      isAuthenticated: false,
      login: '',
      signature: '',
      errorCode: null
    };

    getAuthData(req);
    if (req.user.errorCode) next();

    config.keyRetriever(req.user.login)
    .then(key => {
      if (!key) {
        req.user.errorCode = 'NO_KEY';
        next();
        return;
      }
      next();
    })
    .catch(err => next(err));
  };
};
