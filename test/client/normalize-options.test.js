'use strict';

const test = require('tape');
const self = require('../../lib/client/normalize-options');

test('client/normalize-options >> Options object is not provided', t => {
  const options = null;
  const result = function () {
    self(options);
  };

  t.throws(result, Error, 'Throws an error');
  t.end();
});

test('client/normalize-options >> Login option is an empty string', t => {
  const options = {
    login: '',
    key: 'a_string'
  };
  const result = function () {
    self(options);
  };

  t.throws(result, Error, 'Throws an error');
  t.end();
});

test('client/normalize-options >> Login option is not a string', t => {
  const options = {
    login: {},
    key: 'a_string'
  };
  const result = function () {
    self(options);
  };

  t.throws(result, Error, 'Throws an error');
  t.end();
});

test('client/normalize-options >> Key option is an empty string', t => {
  const options = {
    login: 'a_string',
    key: ''
  };
  const result = function () {
    self(options);
  };

  t.throws(result, Error, 'Throws an error');
  t.end();
});

test('client/normalize-options >> Key option is not a string', t => {
  const options = {
    login: 'a_string',
    key: {}
  };
  const result = function () {
    self(options);
  };

  t.throws(result, Error, 'Throws an error');
  t.end();
});

test('client/normalize-options >> Correct options', t => {
  const options = {
    login: 'a_string',
    key: 'a_string'
  };
  const result = self(options);

  t.equal(result, options, 'Returns unchanged options object');
  t.end();
});
