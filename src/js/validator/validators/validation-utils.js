'use strict';

var constants = require('../../schema/constants');

module.exports.validateArity = function validateArity(objs, spec, customErr) {
  var errors = [];
  if (spec.maxArity === constants.UNBOUNDED_ARITY) { return errors; }

  if (objs.length > spec.maxArity) {
    errors.push(customErr([
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

module.exports.isRequired = function isRequired(spec) {
  return ( spec.minArity > 0 );
};
