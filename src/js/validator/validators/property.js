'use strict';

module.exports = function(node, nodeSpec) {
  var errors = [];
  var nodeId = node.getId();
  var props = node.getProps();
  var propSpec = nodeSpec.propertySpecMap;

  Object.keys(propSpec).forEach(function(property) {
    // check arity & existence of property
    // check type of value
    // check restrictions

  });

  return errors;
};
