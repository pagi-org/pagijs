'use strict';

var spanContainerValidator = require('./span-container');
var edgeValidator = require('./edge');
var propValidator = require('./property');
var spanValidator = require('./span');

module.exports = function nodeValidator(node, nodeSpec) {
  var errors = [];

  errors.push.apply(errors, propValidator(node, nodeSpec));
  errors.push.apply(errors, edgeValidator(node, nodeSpec));

  if (nodeSpec.traitSpan) {
    errors.push.apply(errors, spanValidator(node, nodeSpec));
  }

  if (nodeSpec.traitSpanContainer) {
    errors.push.apply(errors, spanContainerValidator(node, nodeSpec));
  }

  return errors;
};
