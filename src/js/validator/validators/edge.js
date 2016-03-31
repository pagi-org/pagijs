'use strict';

var validationError = require('../validation-error');
var validateArity = require('./validation-utils').validateArity;
var isRequired = require('./validation-utils').isRequired;

function targetExists(id, graph) {
  return !!graph.getNodeById(id);
}

function validateTarget(edge, edgeSpec, nodeId, graph) {
  var errors = [];
  var targetNode = graph.getNodeById(edge.getTargetId());
  var invalidTarget = edgeSpec.targetNodeTypes.indexOf(targetNode.getType()) === -1;

  if (invalidTarget) {
    errors.push(validationError(nodeId, [
      targetNode.getType(),
      'is an invalid target for edge',
      edge.getEdgeType()
    ].join(' ')));
  }

  return errors;
}

function validate(edge, edgeSpec, nodeId, graph) {
  var errors = [];

  if (targetExists(edge.getTargetId(), graph)) {
    errors.push.apply(errors, validateTarget(edge, edgeSpec, nodeId, graph));
  } else {
    errors.push(validationError(nodeId, [
      edge.getEdgeType(),
      'edge points to non-existent node with id',
      edge.getTargetId()
    ].join(' ')));
  }

  return errors;
}

module.exports = function validateEdges(node, graph, nodeSpec) {
  var errors = [];
  var nodeId = node.getId();
  var edgeSpecMap = nodeSpec.edgeSpecMap;

  Object.keys(edgeSpecMap).forEach(function(edgeType) {
    var edgeSpec = edgeSpecMap[edgeType];
    var edges = node.getEdgesByType(edgeType);

    if (edges.length > 0) {
      errors.push.apply(errors, validateArity(edges, edgeSpec, nodeId));

      edges.forEach(function(edge) {
        errors.push.apply(errors, validate(edge, edgeSpec, nodeId, graph));
      });
    } else if (isRequired(edgeSpec)) {
      errors.push(validationError(nodeId, [edgeSpec.name, 'is a required edge'].join(' ')));
    }
  });

  return errors;
};
