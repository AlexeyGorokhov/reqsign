'use strict';

const test = require('tape');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

/**
 * FAKES
 */

const sortParamsStub = require('../../lib/shared/sort-params');
const sortParamsSpy = sinon.spy(sortParamsStub);

const self = proxyquire('../../lib/shared/string-to-sign', {
  './sort-params': sortParamsSpy
});

function getData () {
  return {
    p1: 'v1',
    p2: 'v2'
  };
}

function getTimestamp () {
  return String(Date.now());
}

/**
 * TESTS
 */

test('shared/string-to-sign >> Unsupported HTTP verb', t => {
  const f = function () {
    self('U_VERB', getData(), getTimestamp());
  };
  t.throws(f, Error, 'Throws');
  t.notOk(sortParamsSpy.called, 'Parameter sorting is not called');
  sortParamsSpy.reset();
  t.end();
});

test('shared/string-to-sign >> GET HTTP verb', t => {
  const f = function () {
    self('GET', getData(), getTimestamp());
  };
  t.doesNotThrow(f, Error, 'Does not throw');
  t.ok(sortParamsSpy.called, 'Parameter sorting is called');
  sortParamsSpy.reset();
  t.end();
});

test('shared/string-to-sign >> POST HTTP verb', t => {
  const f = function () {
    self('POST', getData(), getTimestamp());
  };
  t.doesNotThrow(f, Error, 'Does not throw');
  t.notOk(sortParamsSpy.called, 'Parameter sorting is not called');
  sortParamsSpy.reset();
  t.end();
});
