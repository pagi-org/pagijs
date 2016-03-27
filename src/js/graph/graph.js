var Node = require('./node');
var GraphImpl = require('graphlib').Graph;
var deepClone = require('../util').deepClone;

function Graph(id) {
    this._id = id || null;
    this._version = '2.0';
    this._schemaUris = [];
    this._content = null;
    this._contentType = null;
    this._spanNodeTypes = { };
    this._sequenceNodeTypes = { };
    this._spanContainerNodeTypes = { };
    this._nodeTypes = { };
    this._graphImpl = new GraphImpl({ multigraph: true });
}

Graph.prototype.setId = function(id) { this._id = id; };
Graph.prototype.getId = function() { return this._id; };
Graph.prototype.getVersion = function() { return this._version; };

Graph.prototype.addSchemaUri = function(uri) {
    this._schemaUris.push(uri);
};
Graph.prototype.getSchemaUris = function() {
    return this._schemaUris.map(function(schema) { return schema; });
};
Graph.prototype.setContent = function(content) {
    this._content = content;
};
Graph.prototype.getContent = function() {
    return this._content;
};
Graph.prototype.setContentType = function(contentType) {
    this._contentType = contentType;
};
Graph.prototype.getContentType = function() {
    return this._contentType;
};
Graph.prototype.setNodeTypeAsSpan = function(nodeType, attrMap) {
    this._spanNodeTypes[nodeType] = attrMap || { };
};
Graph.prototype.getNodeTypesAsSpan = function() {
    return deepClone(this._spanNodeTypes);
};
Graph.prototype.setNodeTypeAsSequence = function(nodeType, attrMap) {
    this._sequenceNodeTypes[nodeType] = attrMap || { };
};
Graph.prototype.getNodeTypesAsSequence = function() {
    return deepClone(this._sequenceNodeTypes);
};
Graph.prototype.setNodeTypeAsSpanContainer = function(nodeType, attrMap) {
    this._spanContainerNodeTypes[nodeType] = attrMap || { };
};
Graph.prototype.getNodeTypesAsSpanContainer = function() {
    return deepClone(this._spanContainerNodeTypes);
};
Graph.prototype.addNode = function(node, connectEdges) {
    if (!(node instanceof Node)) {
        throw Error("Parameter must be an instance of Node when calling Graph.addNode.");
    }
    if (this.getNodeById(node.getId()) !== undefined) {
        throw Error("Graph already contains a node with id `" + node.getId() + "`.");
    }
    connectEdges = connectEdges === undefined ? true : false;
    this._graphImpl.setNode(node.getId(), node);
    node.setGraph(this);
    // Create node type buckets.
    this._nodeTypes[node.getType()] = this._nodeTypes[node.getType()] || [];
    this._nodeTypes[node.getType()].push(node);

    if (connectEdges) { this.connectEdges([node]); }
};
Graph.prototype.connectEdges = function(nodes) {
    var self = this;
    (nodes || this._graphImpl.nodes()).forEach(function(nodeId) {
        var node = self._graphImpl.node(nodeId);
        node.getEdges().forEach(function(edge) {
            self._graphImpl.setEdge(node.getId(), edge.getTargetId(), edge.getEdgeType());
        });
        // If node is a span container create edges to all it's children.
        // This allows children to quickly reference their parent nodes.
        // Child nodes may not have edges in the graphImpl yet so create edges
        // based only on the edges array in the node.
        if (node.hasTraitSpanContainer()) {
            var linkNode = self.getNodeById(node.getFirstEdgeByType('first').getTargetId());
            var lastNode = self.getNodeById(node.getFirstEdgeByType('last').getTargetId());
            while (true) {
                self._graphImpl.setEdge(node.getId(), linkNode.getId(), 'parent');
                if (linkNode === lastNode) { break; }
                linkNode = self.getNodeById(linkNode.getFirstEdgeByType('next').getTargetId());
            }
        }
    });
};
Graph.prototype.getNodeById = function(nodeId) { return this._graphImpl.node(nodeId); };
Graph.prototype.getNodeTypes = function() { return Object.keys(this._nodeTypes); };
Graph.prototype.getNodesByType = function(nodeType) {
    if (this._nodeTypes[nodeType] === undefined) { return []; }
    return this._nodeTypes[nodeType].map(function(node) {
        return node;
    });
};
Graph.prototype.getNodeIds = function() {
    return this._graphImpl.nodes();
};
Graph.prototype.getNodes = function() {
    return this.getNodeIds().map(function(nodeId) {
        return this.getNodeById(nodeId);
    }, this);
};

module.exports = Graph;
