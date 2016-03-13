var Edge = require('./edge');
VALID_PROP_TYPES = ['str', 'float', 'int', 'bool'];

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
    return this._properties[key] && this._properties[key].value;
};
Node.prototype.addEdge = function(targetId, targetType, edgeType) {
    this._edges.push(new Edge(targetId, targetType, edgeType));
};
Node.prototype.getEdges = function() {
    return this._edges.map(function(edge) { return edge; });
};
Node.prototype.hasTraitSpan = function() {
    return this._graph.getNodeTypesAsSpan().indexOf(this.type) !== -1;
};
Node.prototype.hasTraitSequence = function() {
    return this._graph.getNodeTypesAsSequence().indexOf(this.type) !== -1;
};
Node.prototype.hasTraitSpanContainer = function() {
    return this._graph.getNodeTypesAsSpanContainer().indexOf(this.type) !== -1;
};
Node.prototype.setGraph = function(graph) {
    this._graph = graph;
};

module.exports = Node;
