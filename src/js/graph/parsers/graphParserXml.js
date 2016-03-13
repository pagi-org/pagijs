var Q = require('q');
var sax = require("sax");
var print = require("util").print;
var Graph = require('../graph');
var Node = require('../node');

function GraphParserXml() { }
// @desc Take a stream and returns a promise. Once resolved the promise will hand off a Graph instance.
// @param readableStream Buffer The stream from which the pagi doc is read.
// @return Promise<Graph>
GraphParserXml.prototype.parse = function(readableStream) {
    var deferred = Q.defer();
	var graph = new Graph();
	var streamParser = sax.createStream(true, { xmlns: true, position: true });
    var currentTag, node;
	streamParser.on("opentag", function(tag) {
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
                    graph.addSchema(tag.attributes.uri.value);
                } catch (err) {
                    console.warn("Graph schema does not contain a uri. [" + err + "]");
                }
                break;
            case 'asSpan':
            case 'asSequence': 
            case 'asSpanContainer':
                try {
                    var cap = (tag.name[0].toUpperCase()) + tag.name.slice(1, tag.name.length);
                    graph['setNodeType' + cap](tag.attributes.nodeType.value);
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
                } catch (err) {
                    throw Error("Failed to parse node `id` and `type`. [" + err + "]");
                }
                break;
            case 'intProp':
            case 'floatProp':
            case 'boolProp':
            case 'strProp':
                if (node) { 
                    try {
                        var pAttrs = tag.attributes;
                        node.addProp(tag.name.replace('Prop', ''), pAttrs.k.value, pAttrs.v.value);
                    } catch (err) {
                        throw Error("Failed to parse property for node `" + node.id + "`. [" + err + "]");
                    }
                }
                break;
            case 'edge': 
                if (node) {
                    try {
                        var eAttrs = tag.attributes;
                        node.addEdge(eAttrs.to.value, eAttrs.toType.value, eAttrs.type.value);
                    } catch (err) {
                        throw Error("Failed to parse edge for node `" + node.id + "`. [" + err + "]");
                    }
                }
                break;
        }
	});
    streamParser.on('text', function(text) {
        if (!currentTag || !currentTag.name) { return; }
        if (currentTag.name === 'content') {
            graph.setContent(text);
        }
    });
	streamParser.on("closetag", function(tagName) {
        switch (tagName) {
            case 'node':
                graph.addNode(node, false);
                node = null;
                break;
        }
	});
    streamParser.on("end", function() {
        graph.connectEdges();
        deferred.resolve(graph);
    });
	streamParser.on("error", function(err) {
		readableStream.pause();
		readableStream.unpipe(streamParser);
        deferred.reject(err);
	});
	try {
        readableStream.pipe(streamParser);
	} catch (e) {
		throw Error("Could not parse stream " + readableStream.id + "..." + e);
	}
    return deferred.promise;
};

module.exports = GraphParserXml;
