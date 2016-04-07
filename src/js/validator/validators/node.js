'use strict';

var propValidator = require('./property');
var edgeValidator = require('./edge');

module.exports = function nodeValidator(node, graph, nodeSpec, customErr) {
  var errors = [];

  errors.push.apply(errors, propValidator(node, nodeSpec, customErr));
  errors.push.apply(errors, edgeValidator(node, graph, nodeSpec, customErr));

  return errors;
};
