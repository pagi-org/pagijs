'use strict';

var validateArity = require('./validation-utils').validateArity;
var isRequired = require('./validation-utils').isRequired;
var validationError = null;

function isOutOfRange(value, range) {
  return !(( range.minRange <= value ) && ( value <= range.maxRange ));
}

function validateIntProp(prop, propSpec) {
  var errors = [];

  function isInteger(n) {
    return ( n === +n ) && ( n === (n|0) );
  }

  prop.vals.forEach(function(val) {
    if (!isInteger(val)) {
      errors.push(validationError([propSpec.name, 'must be an integer'].join(' ')));
    }

    if (isOutOfRange(val, propSpec.restrictions)) {
      errors.push(validationError([
        propSpec.name,
        'must be within',
        propSpec.restrictions.minRange,
        'and',
        propSpec.restrictions.maxRange
      ].join(' ')));
    }
  });

  return errors;
}

function validateFloatProp(prop, propSpec) {
  var errors = [];

  prop.vals.forEach(function(val) {
    if (typeof val !== 'number') {
      errors.push(validationError([propSpec.name, 'must be a float'].join(' ')));
    }

    if (isOutOfRange(val, propSpec.restrictions)) {
      errors.push(validationError([
        propSpec.name,
        'must be within',
        propSpec.restrictions.minRange,
        'and',
        propSpec.restrictions.maxRange
      ].join(' ')));
    }
  });

  return errors;
}

function validateStringRestrictions(prop, restrictions) {
  var errors = [];

  prop.vals.forEach(function(val) {
    if (restrictions.items.indexOf(val) === -1) {
      errors.push(validationError([val, 'is not a valid value for property', prop.key].join(' ')));
    }
  });

  return errors;
}

function validateStringProp(prop, propSpec) {
  var errors = [];

  function valueIsEnumerated(restrictions) {
    return !!restrictions.items;
  }

  prop.vals.forEach(function(val) {
    if (typeof val !== 'string') {
      errors.push(validationError([propSpec.name, 'must be a string'].join(' ')));
    }
  });

  if (valueIsEnumerated(propSpec.restrictions)) {
    errors.push.apply(errors, validateStringRestrictions(prop, propSpec.restrictions));
  }

  return errors;
}

function validateBoolProp(prop, propSpec) {
  var errors = [];

  prop.vals.forEach(function(val) {
    if (typeof val !== 'boolean') {
      errors.push(validationError([propSpec.name, 'must be a boolean'].join(' ')));
    }
  });

  return errors;
}

module.exports = function validateProperties(node, nodeSpec, customErr) {
  var errors = [];
  var nodePropMap = node.getProps();
  var propSpecMap = nodeSpec.propertySpecMap;

  validationError = customErr;

  Object.keys(propSpecMap).forEach(function(propName) {
    var propSpec = propSpecMap[propName];
    var prop = nodePropMap[propSpec.name];

    if (prop) {
      errors.push.apply(errors, validateArity(prop.vals, propSpec, validationError));

      switch(propSpec.valueType.name) {
        case 'INTEGER':
          errors.push.apply(errors, validateIntProp(prop, propSpec));
          break;
        case 'FLOAT':
          errors.push.apply(errors, validateFloatProp(prop, propSpec));
          break;
        case 'STRING':
          errors.push.apply(errors, validateStringProp(prop, propSpec));
          break;
        case 'BOOLEAN':
          errors.push.apply(errors, validateBoolProp(prop, propSpec));
          break;
        default:
          throw new Error('Schema valueType ' + propSpec.valueType.name + ' not a valid type.');
      }
    } else if (isRequired(propSpec)) {
      errors.push(validationError([propSpec.name, 'is a required property'].join(' ')));
    }

  });

  return errors;
};
