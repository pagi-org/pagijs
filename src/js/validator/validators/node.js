'use strict';

var propValidator = require('./property');
var edgeValidator = require('./edge');

module.exports = function nodeValidator(node, graph, nodeSpec) {
  var errors = [];

  errors.push.apply(errors, propValidator(node, nodeSpec));
  errors.push.apply(errors, edgeValidator(node, graph, nodeSpec));

  return errors;
};
