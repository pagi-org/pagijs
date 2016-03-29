'use strict';

var nodeValidator = require('./validators/node');
var validationError = require('./validation-error');

function validateNode(id, graph, schema) {
  var errors = [];
  var node = graph.getNodeById(id);
  var nodeSpec = schema.nodeTypeMap[node.getType()];

  if (node && nodeSpec) {
    errors = nodeValidator(node, graph, nodeSpec);
  } else if (!node) {
    errors.push(validationError(id, ['Node with id', id, 'does not exist'].join(' ')));
  } else {
    errors.push(validationError(node.getId(), [node.getType(), 'is not defined in', schema.id].join(' ')));
  }

  var isValid = (errors.length === 0);
  return {
    isValid: isValid,
    errors: errors
  };
}

function validateGraph(graph, schema) {
  var errors = [];

  graph.getNodeIds().forEach(function(nodeId) {
    var validation = validateNode(nodeId, graph, schema);
    if (!validation.isValid) {
      errors.push.apply(errors, validation.errors);
    }
  });

  var isValid = (errors.length === 0);
  return {
    isValid: isValid,
    errors: errors
  };
}

module.exports.validateNode = validateNode;

module.exports.validateGraph = validateGraph;
