'use strict';

function validationError(nodeId, message) {
  return {
    nodeId: nodeId,
    message: message
  };
}

module.exports = validationError;
