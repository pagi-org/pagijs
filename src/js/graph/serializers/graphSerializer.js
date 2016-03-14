// Description:
//   Provides access to the different graph serializers available in the library.

var Graph = require('../graph');
var GraphSerializerXml = require('../serializers/graphSerializerXml');
// var GraphSerializerFlat = require('./graphSerializerFlat');
// var GraphSerializerBinary = require('./graphSerializerBinary');

function serializeXml(graph) {
    return (new GraphSerializerXml()).serialize(graph);
}
// function serializeFlat(graph) { 
//     return (new GraphSerializerFlat()).serialize(graph);
// }
// function serializeBinary(graph) { 
//     return (new GraphSerializerBinary()).serialize(graph);
// }

// General access function, defaults to XML.
module.exports.serialize = serializeXml;

// Serializer implementations
module.exports.serializeXml = serializeXml;
// module.exports.serializeFlat = serializeFlat;
// module.exports.serializeBinary = serializeBinary;
