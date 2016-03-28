'use strict';

var validationError = require('../validation-error');

function isRequired(propSpec) {
  return ( propSpec.minArity > 0 );
}

function isOutOfRange(value, range) {
  return ( range.minRange <= value ) && ( value <= range.maxRange );
}

function validateIntProp(propVals, propSpec, nodeId) {
  var errors = [];

  function isInteger(n) {
    return ( n === +n ) && ( n === (n|0) );
  }

  if (!isInteger(prop.value)) {
    errors.push(validationError(nodeId, [propSpec.name, 'must be an integer'].join(' ')));
  }

  if (isOutOfRange(prop.value, propSpec.restrictions)) {
    errors.push(validationError(nodeId, [
      propSpec.name,
      'must be within',
      propSpec.restrictions.minRange,
      'and',
      propSpec.restrictions.maxRange
    ].join(' ')));
  }

  return errors;
}

function validateFloatProp(propVals, propSpec, nodeId) {
  var errors = [];

  if (typeof prop.value !== 'number') {
    errors.push(validationError(nodeId, [propSpec.name, 'must be a float'].join(' ')));
  }

  if (isOutOfRange(prop.value, propSpec.restrictions)) {
    errors.push(validationError(nodeId, [
      propSpec.name,
      'must be within',
      propSpec.restrictions.minRange,
      'and',
      propSpec.restrictions.maxRange
    ].join(' ')));

  return errors;
}

function validateStringProp(propVals, propSpec, nodeId) {

}

function validateBoolProp(propVals, propSpec, nodeId) {
  var errors = [];

  if (typeof prop.value !== 'boolean') {
    errors.push(validationError(nodeId, [propSpec.name, 'must be a boolean'].join(' ')));
  }

  return errors;
}

module.exports = function validateProperties(node, nodeSpec) {
  var errors = [];
  var nodeId = node.getId();
  var nodePropMap = node.getProps();
  var propSpecMap = nodeSpec.propertySpecMap;

  Object.keys(propSpecMap).forEach(function(propName) {
    var propSpec = propertySpecMap[propName];
    var propVals = nodePropMap[propSpec.name];

    if (propVals) {
      switch(propSpec.valueType.name) {
        case 'INTEGER':
          errors.push.apply(errors, validateIntProp(propVals, propSpec, nodeId));
          break;
        case 'FLOAT':
          errors.push.apply(errors, validateFloatProp(propVals, propSpec, nodeId));
          break;
        case 'STRING':
          errors.push.apply(errors, validateStringProp(propVals, propSpec, nodeId));
          break;
        case 'BOOLEAN':
          errors.push.apply(errors, validateBoolProp(propVals, propSpec, nodeId));
          break;
        default:
          throw new Error('Schema valueType ' + propSpec.valueType.name + ' is not a valid type.');
      }
    } else if (isRequired(propSpec)) {
      errors.push(validationError(nodeId, [propSpec.name, 'is a required property'].join(' ')));
    }

  });

  return errors;
};
