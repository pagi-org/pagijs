'use strict';

module.exports.createTemplate = createTemplate;

function createTemplate(id, nodeType) {
  return function validationError(message, targetId) {
    return {
      nodeId: id,
      targetId: targetId,
      nodeType: nodeType,
      message: message
    };
  };
}
