var Q = require('q');
var sax = require("sax");
// var print = require("util").print;
var Graph = require('../graph');
var Node = require('../node');

function GraphParserXml() { }
// @desc Take a stream and returns a promise. Once resolved the promise will hand off a Graph instance.
// @param readableStream Buffer The stream from which the pagi doc is read.
// @return Promise<Graph>
GraphParserXml.prototype.parse = function(readableStream) {
    return Q.Promise(function(resolve, reject, notify) {
        var graph = new Graph();
        var streamParser = sax.createStream(true, { xmlns: true, position: true });
        var currentTag, node, content = '';
        var nodePropMap = {
            'str': 'string',
            'float': 'float',
            'int': 'integer',
            'bool': 'boolean'
        };
        var multiValData = null;

        streamParser.on("opentag", function(tag) {
            var pAttrs = null;
            currentTag = tag;
            switch (tag.name) {
                case 'document':
                    try {
                        graph.setId(tag.attributes.id.value);
                    } catch (err) {
                        console.warn("Graph does not contain an ID. [" + err + "]");
                    }
                    break;
                case 'schema':
                    try {
                        graph.addSchemaUri(tag.attributes.uri.value);
                    } catch (err) {
                        console.warn("Graph schema does not contain a uri. [" + err + "]");
                    }
                    break;
                case 'asSpan':
                case 'asSequence':
                case 'asSpanContainer':
                    try {
                        var cap = (tag.name[0].toUpperCase()) + tag.name.slice(1, tag.name.length);
                        var traitAttrs = { };
                        // Capture all the extra attributes for a trait.
                        Object.keys(tag.attributes).forEach(function(attr) {
                            if (attr === 'nodeType') { return; }
                            traitAttrs[attr] = tag.attributes[attr].value;
                        });
                        graph['setNodeType' + cap](tag.attributes.nodeType.value, traitAttrs);
                    } catch (err) {
                        console.warn("There was an error parsing " + tag.name + ". [" + err + "]");
                    }
                    break;
                case 'content':
                    try {
                        graph.setContentType(tag.attributes.contentType.value);
                    } catch (err) {
                        console.warn("Graph content does not contain a content type. [" + err + "]");
                    }
                    break;
                case 'node':
                    node = new Node();
                    try {
                        node.setId(tag.attributes.id.value);
                        node.setType(tag.attributes.type.value);
                        graph.addNode(node, false);
                    } catch (err) {
                        reject(new Error("Failed to parse node `id` and `type`. [" + err + "]"));
                    }
                    break;
                case 'intProp':
                case 'floatProp':
                case 'boolProp':
                case 'strProp':
                    if (node) {
                        try {
                            pAttrs = tag.attributes;
                            if (pAttrs.k && !pAttrs.v) {
                                multiValData = {
                                    type: tag.name.replace('Prop', ''),
                                    key: pAttrs.k.value
                                };
                                node.addProp(nodePropMap[tag.name.replace('Prop', '')], pAttrs.k.value);
                            } else {
                                node.addProp(nodePropMap[tag.name.replace('Prop', '')], pAttrs.k.value, pAttrs.v.value);
                            }
                        } catch (err) {
                            reject(new Error("Failed to parse property for node `" + node.id + "`. [" + err + "]"));
                        }
                    }
                    break;
                case 'enumProp':
                    // Parse and encode enumProps into the graph like strProp nodes
                    if (node) {
                        try {
                            pAttrs = tag.attributes;
                            var STRING_PROP_PREFIX = 'str';
                            if (pAttrs.k && !pAttrs.v) {
                                multiValData = {
                                    type: STRING_PROP_PREFIX,
                                    key: pAttrs.k.value
                                };
                                node.addProp(nodePropMap[STRING_PROP_PREFIX], pAttrs.k.value);
                            } else {
                                node.addProp(nodePropMap[STRING_PROP_PREFIX], pAttrs.k.value, pAttrs.v.value);
                            }
                        } catch (err) {
                            reject(new Error("Failed to parse property for node `" + node.id + "`. [" + err + "]"));
                        }
                    }
                    break;
                case 'val':
                    if (node && multiValData) {
                        try {
                            pAttrs = tag.attributes;
                            node.addProp(nodePropMap[multiValData.type], multiValData.key, pAttrs[multiValData.type].value);
                        } catch (err) {
                            reject(new Error("Failed to parse property for node `" + node.id + "`. [" + err + "]"));
                        }
                    }
                    break;
                case 'intFeat':
                case 'floatFeat':
                case 'boolFeat':
                case 'strFeat':
                    console.warn('Pagi.js does not support parsing ' + tag.name + ' and it was not added to the graph');
                    break;
                case 'edge':
                    if (node) {
                        try {
                            var eAttrs = tag.attributes;
                            node.addEdge(eAttrs.to.value, eAttrs.toType.value, eAttrs.type.value, false);
                        } catch (err) {
                            reject(new Error("Failed to parse edge for node `" + node.id + "`. [" + err + "]"));
                        }
                    }
                    break;
            }
        });
        streamParser.on('text', function(text) {
            if (!currentTag || !currentTag.name) { return; }
            if (currentTag.name === 'content') {
                content += text;
            }
        });
        streamParser.on("closetag", function(tagName) {
            switch (tagName) {
                case 'content':
                    graph.setContent(content);
                    content = null;
                    break;
                case 'node':
                    node = null;
                    break;
                case 'val':
                    multiValData = null;
                    break;
            }
        });
        streamParser.on("end", function() {
            graph.connectEdges();
            resolve(graph);
        });
        streamParser.on("error", function(err) {
            readableStream.pause();
            readableStream.unpipe(streamParser);
            reject(err);
        });
        try {
            readableStream.pipe(streamParser);
        } catch (e) {
            reject(new Error("Could not parse stream " + readableStream.id + "..." + e));
        }
    });
};

module.exports = GraphParserXml;
