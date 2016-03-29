'use strict';

var validationError = require('../validation-error');
var constants = require('../../schema/constants');

module.exports = function validateArity(objs, spec, nodeId) {
  var errors = [];
  if (spec.maxArity === constants.UNBOUNDED_ARITY) { return errors; }

  if (objs.length > spec.maxArity) {
    errors.push(validationError(nodeId, [
      'Arity of',
      spec.name,
      'property is out of range. Arity min:',
      spec.minArity,
      'Arity max:',
      spec.maxArity,
      'Arity Actual:',
      objs.length
    ].join(' ')));
  }

  return errors;
};
