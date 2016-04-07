'use strict';

module.exports.createTemplate = createTemplate;

function createTemplate(id, nodeType) {
  return function validationError(message) {
    return {
      nodeId: id,
      nodeType: nodeType,
      message: message
    };
  }
}
