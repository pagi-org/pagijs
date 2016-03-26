
module.exports.validateNode = function(id, graph, schema) {

};

module.exports.validateGraph = function(graph, schema) {
  var errors = [];

  graph.getNodes().forEach(function(node) {

  });

  var isValid = (errors.length === 0);
  return {
    isValid: isValid,
    errors: errors
  };
}
