var Graph = require('../graph');
var TAB = "    ";

function GraphSerializerXml() { }
GraphSerializerXml.prototype.serializeTrait = function(nodeTypeMap, tagName) {
    var lines = [];
    Object.keys(nodeTypeMap).map(function(nodeType) {
        var attrs = nodeTypeMap[nodeType];
        var attrStr = Object.keys(attrs).map(function(key) {
            return key + '="' + attrs[key] + '"';
        }).join(' ');
        if (attrStr.length > 0) { attrStr = ' ' + attrStr; }
        lines.push(TAB + '<' + tagName + attrStr + ' nodeType="' + nodeType + '"></' + tagName + '>');
    });
    return lines.join("\n");
};
GraphSerializerXml.prototype.serializeNode = function(node) {
    var lines = [TAB + '<node id="' + node.getId() + '" type="' + node.getType() + '">'];
    var props = node.getProps();
    Object.keys(props).forEach(function(key) {
        var prop = props[key];
        lines.push(TAB+TAB + '<' + prop.type + 'Prop v="' + prop.val + '" k="' + prop.key + '"></' + prop.type + 'Prop>');
    });
    node.getEdges().forEach(function(edge) {
        lines.push(TAB+TAB + '<edge toType="' + edge.getTargetType() + '" to="' + edge.getTargetId() + '" type="' + edge.getEdgeType() + '"></edge>');
    });
    lines.push(TAB + '</node>');
    return lines.join("\n");
};
GraphSerializerXml.prototype.serialize = function(graph) {
    if (!(graph instanceof Graph)) {
        throw Error("`GraphSerializerXml.serialize` expects a Graph instance.");
    }
    var self = this;
    var lines = ['<?xml version="1.0" encoding="UTF-8"?>'];
    var docLine = '<document xmlns="http://pagi.org/stream" id="' + graph.getId() + '" version="' + graph.getVersion() + '">';
    var schemas = '';
    graph.getSchemaUris().forEach(function(schemaUri) {
        schemas += '<schema uri="' + schemaUri + '"></schema>';
    });
    lines.push(docLine + schemas);
    lines.push(this.serializeTrait(graph.getNodeTypesAsSpan(), 'asSpan'));
    lines.push(this.serializeTrait(graph.getNodeTypesAsSequence(), 'asSequence'));
    lines.push(this.serializeTrait(graph.getNodeTypesAsSpanContainer(), 'asSpanContainer'));
    lines.push(TAB + '<content contentType="' + graph.getContentType() + '">' + graph.getContent() + '</content>');
    lines.push("");
    graph.getNodes().forEach(function(node) {
        lines.push(self.serializeNode(node));
    });
    lines.push('</document>');
    return lines.join("\n");
};

module.exports = GraphSerializerXml;
