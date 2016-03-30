var Node = require('./node');
var GraphImpl = require("graphlib").Graph;

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
    // Don't return a direct reference to the object.
    return JSON.parse(JSON.stringify(this._spanNodeTypes));
};
Graph.prototype.setNodeTypeAsSequence = function(nodeType, attrMap) {
    this._sequenceNodeTypes[nodeType] = attrMap || { };
};
Graph.prototype.getNodeTypesAsSequence = function() {
    // Don't return a direct reference to the object.
    return JSON.parse(JSON.stringify(this._sequenceNodeTypes));
};
Graph.prototype.setNodeTypeAsSpanContainer = function(nodeType, attrMap) {
    this._spanContainerNodeTypes[nodeType] = attrMap || { };
};
Graph.prototype.getNodeTypesAsSpanContainer = function() {
    // Don't return a direct reference to the object.
    return JSON.parse(JSON.stringify(this._spanContainerNodeTypes));
};
Graph.prototype.addNode = function(node, connectEdges) {
    if (!(node instanceof Node)) {
        throw Error("Parameter must be an instance of Node when calling Graph.addNode.");
    }
    if (node.getType() === null) {
        throw Error("Adding a node to the graph must have a TYPE.");
    }
    if (this.getNodeById(node.getId()) !== undefined) {
        throw Error("Graph already contains a node with id `" + node.getId() + "`.");
    }
    if (!node.getId()) {
        node.setId(this._generateNodeId());
    }
    // console.log("ADD NODE id: " + node.getId() + ", type: " + node.getType() + ".");
    connectEdges = connectEdges === undefined ? true : false;
    this._graphImpl.setNode(node.getId(), node);
    node.setGraph(this);
    // Create node type buckets.
    this._nodeTypes[node.getType()] = this._nodeTypes[node.getType()] || [];
    this._nodeTypes[node.getType()].push(node);
    if (connectEdges) { node.connectEdges(); }
};
Graph.prototype.connectEdges = function() {
    // console.log("Graph.connectEdges ------------------------");
    this.getNodes().forEach(function(node) {
        node.connectEdges();
    });
    // console.log("Graph.connectEdges ------------------------");
};
Graph.prototype.removeNode = function(node) {
    if (!(node instanceof Node)) {
        throw Error("Parameter must be an instance of Node when calling Graph.removeNode.");
    }
    node.removeEdges();
    this._nodeTypes[node.getType()] = this._nodeTypes[node.getType()].filter(function(aNode) {
        return aNode.getId() !== node.getId();
    });
    if (this._nodeTypes[node.getType()].length === 0) {
        delete this._nodeTypes[node.getType()];
    }
    node.removeGraph();
    this._graphImpl.removeNode(node.getId());
};
Graph.prototype.getNodeById = function(nodeId) { return this._graphImpl.node(nodeId); };
Graph.prototype.getNodeTypes = function() { return Object.keys(this._nodeTypes); };
Graph.prototype.getNodesByType = function(nodeType) {
    if (this._nodeTypes[nodeType] === undefined) { return []; }
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

// Manipulation functions
Graph.prototype.createNode = function() {
    return new Node();
};

// Hidden functions
Graph.prototype._generateNodeId = function() {
    // Increment the max id by one to get the new id.
    return (this.getNodes().reduce(function(minId, node) {
        var nodeId = node.getId() ? parseInt(node.getId()) : -1;
        if (nodeId > minId) { return nodeId; }
        return minId;
    }, 0) + 1).toString();
};

module.exports = Graph;
