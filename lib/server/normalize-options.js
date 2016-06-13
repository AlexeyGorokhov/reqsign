'use strict';

module.exports = function normalizeOptions (options) {
  return {
    clockSkew: normalizeClockSkew(options),
    keyRetriever: normalizeKeyRetriever(options),
    replayAttackDefender: normalizeReplayAttackDefender(options)
  };
};

function normalizeClockSkew (options) {
  let value = options.clockSkew || 300;
  if (value < 60) value = 60;
  return value;
}

function normalizeKeyRetriever (options) {
  if (!options.keyRetriever) {
    throw new Error('keyRetriever option required');
  }

  if ((typeof options.keyRetriever) !== 'function') {
    throw new Error('keyRetriever option must be a function');
  }

  return options.keyRetriever;
}

function normalizeReplayAttackDefender (options) {
  if ((typeof options.replayAttackDefender) !== 'function') {
    return function () {
      return new Promise((resolve, reject) => resolve());
    };
  }
  return options.replayAttackDefender;
}
