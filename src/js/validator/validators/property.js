'use strict';

var validationError = require('../validation-error');

function isRequired(propSpec) {
  return ( propSpec.minArity > 0 );
}

function isOutOfRange(value, range) {
  return ( range.minRange <= value ) && ( value <= range.maxRange );
}

function validateIntProp(prop, propSpec, nodeId) {
  console.log('Int props were validated');
  var errors = [];

  function isInteger(n) {
    return ( n === +n ) && ( n === (n|0) );
  }

  if (!isInteger(prop.val)) {
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

function validateFloatProp(prop, propSpec, nodeId) {
  console.log('Float props were validated');
  var errors = [];

  if (typeof prop.val !== 'number') {
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
  }

  return errors;
}

function validateStringRestrictions(prop, restrictions, nodeId) {
  console.log('String restrictions were validated');
  var errors = [];

  if (restrictions.items.indexOf(prop.val) === -1) {
    errors.push(validationError(nodeId, [prop.val, 'is not a valid value for property', prop.key].join(' ')));
  }

  return errors;
}

function validateStringProp(prop, propSpec, nodeId) {
  console.log('String props were validated');
  var errors = [];

  function valueIsEnumerated(restrictions) {
    return !!restrictions.items;
  }

  if (typeof prop.val !== 'string') {
    errors.push(validationError(nodeId, [propSpec.name, 'must be a string'].join(' ')));
  }

  if (valueIsEnumerated(propSpec.restrictions)) {
    errors.push.apply(errors, validateStringRestrictions(prop, propSpec.restrictions, nodeId));
  }

  return errors;
}

function validateBoolProp(prop, propSpec, nodeId) {
  console.log('Bool props were validated');
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
    var propSpec = propSpecMap[propName];
    var props = nodePropMap[propSpec.name];

    if (props) {
      props.forEach(function(prop) {
        switch(propSpec.valueType.name) {
          case 'INTEGER':
            errors.push.apply(errors, validateIntProp(prop, propSpec, nodeId));
            break;
          case 'FLOAT':
            errors.push.apply(errors, validateFloatProp(prop, propSpec, nodeId));
            break;
          case 'STRING':
            errors.push.apply(errors, validateStringProp(prop, propSpec, nodeId));
            break;
          case 'BOOLEAN':
            errors.push.apply(errors, validateBoolProp(prop, propSpec, nodeId));
            break;
          default:
            throw new Error('Schema valueType ' + propSpec.valueType.name + ' not a valid type.');
        }
      });
    } else if (isRequired(propSpec)) {
      errors.push(validationError(nodeId, [propSpec.name, 'is a required property'].join(' ')));
    }

  });

  return errors;
};
