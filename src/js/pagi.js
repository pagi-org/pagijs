var Graph = require('./graph/graph');
var GraphParser = require('./graph/parsers/graphParser');
var GraphSerializer = require('./graph/serializers/graphSerializer');
var validator = require('./validator');

module.exports.parse = function(readableStream) {
  return GraphParser.parse(readableStream);
};

module.exports.serialize = function(graph) {
  if (!(graph instanceof Graph)) { throw Error("`Pagi.serialize` expects a Graph instance."); }
  return GraphSerializer.serialize(graph);
};

module.exports.validateGraph = function(graph, schema) {
  if (!(graph instanceof Graph)) { throw Error("`Pagi.validateGraph` expects a Graph instance."); }
  return validator.validateGraph(graph, schema);
}

module.exports.validateNode = function(id, graph, schema) {
  if (!(graph instanceof Graph)) { throw Error("`Pagi.validateGraph` expects a Graph instance."); }
  return validator.validateNode(id, graph, schema);
};

module.exports.GraphParser = GraphParser;
module.exports.GraphSerializer = GraphSerializer;
module.exports.schema = require('./schema');
