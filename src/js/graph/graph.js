var Node = require('./node');
var GraphImpl = require("graphlib").Graph;

function Graph(id) {
    this._id = id || null;
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
    return JSON.parse(JSON.stringify(this._spanNodeTypes));
};
Graph.prototype.setNodeTypeAsSequence = function(nodeType, attrMap) {
    this._sequenceNodeTypes[nodeType] = attrMap || { };
};
Graph.prototype.getNodeTypesAsSequence = function() {
    return JSON.parse(JSON.stringify(this._sequenceNodeTypes));
};
Graph.prototype.setNodeTypeAsSpanContainer = function(nodeType, attrMap) {
    this._spanContainerNodeTypes[nodeType] = attrMap || { };
};
Graph.prototype.getNodeTypesAsSpanContainer = function() {
    return JSON.parse(JSON.stringify(this._spanContainerNodeTypes));
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
            // If we add a `next` edge then create a `previous` edge from the second node.
            if (edge.getEdgeType() === 'next') {
                self._graphImpl.setEdge(edge.getTargetId(), node.getId(), 'previous');
            }
        });
    });
};
Graph.prototype.getNodeById = function(nodeId) {
    return this._graphImpl.node(nodeId);
};
Graph.prototype.getNodesByType = function(nodeType) {
    return this._nodeTypes[nodeType].map(function(node) {
        return node;
    });
};
Graph.prototype.getNodes = function() {
    var self = this;
    return self._graphImpl.nodes().map(function(nodeId) {
        return self._graphImpl.node(nodeId);
    });
};

module.exports = Graph;
