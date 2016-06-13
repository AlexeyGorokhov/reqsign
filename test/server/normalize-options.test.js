'use strict';

const test = require('tape');
const self = require('../../lib/server/normalize-options');

/**
 * Fakes
 */

function getNormalOptions () {
  return {
    clockSkew: 500,
    keyRetriever () {},
    replayAttackDefender () {}
  };
}

test('normalize-options >> No clock skew option', t => {
  const options = getNormalOptions();
  delete options.clockSkew;

  const result = self(options);

  t.equal(result.clockSkew, 300, 'Clock skew option is set to 300');
  t.end();
});

test('normalize-options >> Clock skew option is less than 60', t => {
  const options = getNormalOptions();
  options.clockSkew = 50;

  const result = self(options);

  t.equal(result.clockSkew, 60, 'Clock skew option is set to 60');
  t.end();
});

test('normalize-options >> No key retriever option', t => {
  const options = getNormalOptions();
  delete options.keyRetriever;
  const result = function () {
    self(options);
  };

  t.throws(result, Error, 'Throws an error');
  t.end();
});

test('normalize-options >> Key retriever option is not a function', t => {
  const options = getNormalOptions();
  options.keyRetriever = 'not_a_function';
  const result = function () {
    self(options);
  };

  t.throws(result, Error, 'Throws an error');
  t.end();
});

test('normalize-options >> No replay attack defender option', t => {
  const options = getNormalOptions();
  delete options.replayAttackDefender;
  const result = self(options);

  t.ok(typeof result.replayAttackDefender === 'function',
    'Replay attack defender is set to an empty function');
  t.end();
});

test('normalize-options >> Replay attack defender is not a function', t => {
  const options = getNormalOptions();
  options.replayAttackDefender = 'not_a_function';
  const result = self(options);

  t.ok(typeof result.replayAttackDefender === 'function',
    'Replay attack defender is set to an empty function');
  t.end();
});
