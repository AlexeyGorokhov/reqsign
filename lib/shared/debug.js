'use strict';

const debug = require('debug')('reqsign');

exports.error = function (message) {
  return debug('Error: ' + message);
};

exports.log = function (message) {
  return debug('Log: ' + message);
};
