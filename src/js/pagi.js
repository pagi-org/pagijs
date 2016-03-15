var Graph = require('./graph/graph');
var GraphParser = require('./graph/parsers/graphParser');
var GraphSerializer = require('./graph/serializers/graphSerializer');

module.exports.parse = function(readableStream) {
    return GraphParser.parse(readableStream);
};
module.exports.serialize = function(graph) {
    if (!(graph instanceof Graph)) { throw Error("`Pagi.serialize` expects a Graph instance."); }
    return GraphSerializer.serialize(graph);
};

module.exports.GraphParser = GraphParser;
module.exports.GraphSerializer = GraphSerializer;
module.exports.schema = require('./schema');
