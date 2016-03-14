var Edge = require('./edge');
VALID_PROP_TYPES = ['string', 'float', 'integer', 'boolean'];

function Node(id, type) {
    this._id = id || null;
    this._type = type || null;
    this._features = { };
    this._properties = { };
    this._edges = [];
    this._graph = null;
}
Node.prototype.setId = function(id) { this._id = id; };
Node.prototype.getId = function() { return this._id; };
Node.prototype.setType = function(type) { this._type = type; };
Node.prototype.getType = function() { return this._type; };
// Node.prototype.addFeature = function(key, val) { };
// Node.prototype.getFeature = function(key) { };
Node.prototype.addProp = function(type, key, val) {
    var newVal;
    type = type.toLowerCase();
    switch (type) {
        case VALID_PROP_TYPES[0]:
            newVal = val.toString(); break;
        case VALID_PROP_TYPES[1]:
            newVal = parseInt(val); break;
        case VALID_PROP_TYPES[2]:
            newVal = parseFloat(val); break;
        case VALID_PROP_TYPES[3]:
            newVal = val === 'true'; break;
        default:
            throw Error("Unknown Node property type `" + type + "`.");
    }
    this._properties[key] = { type: type, key: key, val: newVal };
};
Node.prototype.getProp = function(key) {
    return this._properties[key] && this._properties[key].val;
};
Node.prototype.getProps = function() {
    return JSON.parse(JSON.stringify(this._properties));
};
Node.prototype.addEdge = function(targetId, targetType, edgeType) {
    this._edges.push(new Edge(targetId, targetType, edgeType));
};
Node.prototype.getEdges = function() {
    return this._edges.map(function(edge) { return edge; });
};
Node.prototype.getEdgeByType = function(edgeType) {
    return this._edges.find(function(edge) {
        return edge.getEdgeType() === edgeType;
    });
};
Node.prototype.hasTraitSpan = function() {
    return this._graph.getNodeTypesAsSpan()[this.getType()] !== undefined;
};
Node.prototype.hasTraitSequence = function() {
    return this._graph.getNodeTypesAsSequence()[this.getType()] !== undefined;
};
Node.prototype.hasTraitSpanContainer = function() {
    return this._graph.getNodeTypesAsSpanContainer()[this.getType()] !== undefined;
};
Node.prototype.setGraph = function(graph) {
    this._graph = graph;
};

// Span trait functions
Node.prototype.getText = function() { 
    if (!this.hasTraitSpan()) { throw Error("Calling `getText` on a Node that does not have the `span` trait."); }
    var start = this.getProp('start'), length = this.getProp('length');
    return this._graph.getContent().slice(start, start + length);
};

// Sequence trait functions
Node.prototype.hasNext = function() { 
    if (!this.hasTraitSequence()) { throw Error("Calling `hasNext` on a Node that does not have the `sequence` trait."); }
    return this.getEdgeByType('next') instanceof Edge;
};
Node.prototype._getPreviousEdgeImpl = function() {
    var graphImpl = this._graph._graphImpl;
    return graphImpl.outEdges(this._id).find(function(edgeImpl) {
        return graphImpl.edge(edgeImpl.v, edgeImpl.w) === 'previous';
    });
};
Node.prototype.hasPrevious = function() { 
    if (!this.hasTraitSequence()) { throw Error("Calling `hasPrevious` on a Node that does not have the `sequence` trait."); }
    // Special case, there will not be an explicit `previous` edge. It will only be accessible via the this._graph._graphImpl object.
    var previousImplEdge = this._getPreviousEdgeImpl();
    return !!previousImplEdge;
};
Node.prototype.next = function() { 
    if (!this.hasTraitSequence()) { throw Error("Calling `next` on a Node that does not have the `sequence` trait."); }
    var nextEdge = this.getEdgeByType('next');
    return this._graph.getNodeById(nextEdge.getTargetId());
};
Node.prototype.previous = function() { 
    if (!this.hasTraitSequence()) { throw Error("Calling `previous` on a Node that does not have the `sequence` trait."); }
    // Special case, there will not be an explicit `previous` edge. It will only be accessible via the this._graph._graphImpl object.
    var previousImplEdge = this._getPreviousEdgeImpl();
    if (!previousImplEdge) { return undefined; }
    return this._graph.getNodeById(previousImplEdge.w);
};

// SpanContainer trait functions
Node.prototype.getFirst = function() { 
    if (!this.hasTraitSpanContainer()) { throw Error("Calling `getFirst` on a Node that does not have the `span container` trait."); }
    var firstEdge = this.getEdgeByType('first');
    return this._graph.getNodeById(firstEdge.getTargetId());
};
Node.prototype.getLast = function() { 
    if (!this.hasTraitSpanContainer()) { throw Error("Calling `getLast` on a Node that does not have the `span container` trait."); }
    var lastEdge = this.getEdgeByType('last');
    return this._graph.getNodeById(lastEdge.getTargetId());
};

module.exports = Node;
