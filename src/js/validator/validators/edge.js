'use strict';

var validationError = require('../validation-error');
var validateArity = require('./validation-utils').validateArity;
var isRequired = require('./validation-utils').isRequired;

function invalidTarget(edge, edgeSpec) {
  return (edgeSpec.targetNodeTypes.indexOf(edge.getTargetType()) === -1);
}

function targetExists(id, graph) {
  return !!graph.getNodeById(id);
}

function validate(edge, edgeSpec, nodeId, graph) {
  var errors = [];

  if (invalidTarget(edge, edgeSpec)) {
    errors.push(validationError(nodeId, [
      edge.getTargetType(),
      'is an invalid target for edge',
      edge.getEdgeType()
    ].join(' ')));
  }

  if (!targetExists(edge.getTargetId(), graph)) {
    errors.push(validationError(nodeId, [
      edge.getEdgeType(),
      'points to non-existent node with id',
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
