'use strict';

const test = require('tape');

const self = require('../../lib/server/get-auth-data');

/**
 * FAKES
 */

function getRequestStub () {
  return {
    headers: {},
    user: {
      isAuthenticated: false,
      login: '',
      errorCode: null
    }
  };
}

/**
 * TESTS
 */

test('get-auth-data >> No Authorization header', t => {
  const reqStub = getRequestStub();

  self(reqStub);

  t.ok(reqStub.user.errorCode, 'Error code is present');
  t.end();
});

test('get-auth-data >> No Signature flag in Authorization header', t => {
  const reqStub = getRequestStub();

  reqStub.headers.authorization = 'login=abc signature=def';

  self(reqStub);

  t.ok(reqStub.user.errorCode, 'Error code is present');
  t.end();
});

test('get-auth-data >> No login field in Authorization header', t => {
  const reqStub = getRequestStub();

  reqStub.headers.authorization = 'Signature signature=def';

  self(reqStub);

  t.ok(reqStub.user.errorCode, 'Error code is present');
  t.end();
});

test('get-auth-data >> No signature field in Authorization header', t => {
  const reqStub = getRequestStub();

  reqStub.headers.authorization = 'Signature login=abc';

  self(reqStub);

  t.ok(reqStub.user.errorCode, 'Error code is present');
  t.end();
});

test('get-auth-data >> Correct Authorization header', t => {
  const reqStub = getRequestStub();

  reqStub.headers.authorization = 'Signature login=abc signature=def';

  self(reqStub);

  t.notOk(reqStub.user.errorCode, 'No Error code');
  t.ok(reqStub.user.login, 'There is login');
  t.ok(reqStub.user.signature, 'There is signature');
  t.end();
});
