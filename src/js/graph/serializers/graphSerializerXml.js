var xmlEscape = require('xml-escape');
var Graph = require('../graph');
var TAB = "    ";
var nodePropMap = {
    'string': 'str',
    'float': 'float',
    'integer': 'int',
    'boolean': 'bool'
};
var es = function(aVar) {
    return xmlEscape(aVar.toString());
};

function GraphSerializerXml() { }
GraphSerializerXml.prototype.serializeTrait = function(nodeTypeMap, tagName) {
    var lines = [];
    Object.keys(nodeTypeMap).map(function(nodeType) {
        var attrs = nodeTypeMap[nodeType];
        var attrStr = Object.keys(attrs).map(function(key) {
            return key + '="' + es(attrs[key]) + '"';
        }).join(' ');
        if (attrStr.length > 0) { attrStr = ' ' + attrStr; }
        lines.push(TAB + '<' + tagName + attrStr + ' nodeType="' + es(nodeType) + '"/>');
    });
    return lines.join("\n");
};
GraphSerializerXml.prototype.serializeNode = function(node) {
    var lines = [TAB + '<node id="' + es(node.getId()) + '" type="' + es(node.getType()) + '">'];
    var props = node.getProps();
    Object.keys(props).forEach(function(key) {
        var prop = props[key];
        if (prop.vals.length === 1) {
            lines.push(TAB+TAB + '<' + nodePropMap[prop.type] + 'Prop v="' + es(prop.vals[0]) + '" k="' + es(prop.key) + '"/>');
        } else if (prop.vals.length > 1) {
            lines.push(TAB+TAB + '<' + nodePropMap[prop.type] + 'Prop k="' + es(prop.key) + '">');
            prop.vals.forEach(function(val) {
                lines.push(TAB+TAB+TAB + '<val ' + nodePropMap[prop.type] + '="' + es(val) + '"/>');
            });
            lines.push(TAB+TAB + '</' + nodePropMap[prop.type] + 'Prop>');
        } else {
            throw Error("`GraphSerializerXml.serializeNode` cannot serialize node properties without values.");
        }
    });
    node.getEdges().forEach(function(edge) {
        lines.push(TAB+TAB + '<edge toType="' + es(edge.getTargetType()) + '" to="' + es(edge.getTargetId()) + '" type="' + es(edge.getEdgeType()) + '"/>');
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
    lines.push('<document xmlns="http://pagi.org/stream" id="' + es(graph.getId()) + '" version="' + es(graph.getVersion()) + '">');
    graph.getSchemaUris().map(function(schemaUri) {
        lines.push('<schema uri="' + es(schemaUri) + '"></schema>');
    });
    lines.push(this.serializeTrait(graph.getNodeTypesAsSpan(), 'asSpan'));
    lines.push(this.serializeTrait(graph.getNodeTypesAsSequence(), 'asSequence'));
    lines.push(this.serializeTrait(graph.getNodeTypesAsSpanContainer(), 'asSpanContainer'));
    lines.push(TAB + '<content contentType="' + es(graph.getContentType()) + '">' + es(graph.getContent()) + '</content>');
    lines.push("");
    graph.getNodes().forEach(function(node) {
        lines.push(self.serializeNode(node));
    });
    lines.push('</document>');
    return lines.join("\n");
};

module.exports = GraphSerializerXml;
