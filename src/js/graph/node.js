var Edge = require('./edge');
var VALID_PROP_TYPES = ['string', 'float', 'integer', 'boolean'];

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
function convertValue(type, value) {
    var newVal;
    switch (type) {
        case VALID_PROP_TYPES[0]:
            newVal = value.toString(); break;
        case VALID_PROP_TYPES[1]:
            newVal = parseFloat(value); break;
        case VALID_PROP_TYPES[2]:
            newVal = parseInt(value); break;
        case VALID_PROP_TYPES[3]:
            newVal = value === 'true'; break;
        default:
            throw Error('Unknown Node property type `' + type + '`.');
    }
    return newVal;
}
Node.prototype.addProp = function(type, key, val) {
    var typeName = type.toLowerCase(),
        newVal;

    if (val !== undefined && val !== null) {
        newVal = convertValue(typeName, val);
        if (this._properties[key]) {
            this._properties[key].vals.push(newVal);
        } else {
            this._properties[key] = { type: typeName, key: key, vals: [newVal] };
        }
    } else {
        this._properties[key] = { type: typeName, key: key, vals: [] };
    }
};
Node.prototype.getProp = function(key) {
    if (this._properties[key] === undefined) { return []; }

    return this._properties[key].vals.map(function(val) {
        return val;
    });
};
Node.prototype.getFirstProp = function(key) {
    // convenience method for properties with known max arity of 1
    return this._properties[key] && this._properties[key].vals[0];
};
Node.prototype.getProps = function() {
    return JSON.parse(JSON.stringify(this._properties));
};
Node.prototype.addEdge = function(targetId, targetType, edgeType, connectEdges) {
    // console.log("ADD EDGE for nodeId: " + this.getId() + ", targetId: " + targetId + ", targetType: " + targetType + ", edgeType: " + edgeType + ".");
    this._edges.push(new Edge(targetId, targetType, edgeType));
    connectEdges = connectEdges === undefined ? true : connectEdges;
    if (connectEdges) { this.connectEdges(); }
};
Node.prototype.getEdges = function() {
    return this._edges.map(function(edge) { return edge; });
};
Node.prototype.getEdgesByType = function(edgeType) {
    return this._edges.filter(function(edge) {
        return edge.getEdgeType() === edgeType;
    });
};
Node.prototype.getFirstEdgeByType = function(edgeType) {
    var edges = this.getEdgesByType(edgeType);
    return edges.length > 0 ? edges[0] : undefined;
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
Node.prototype.removeGraph = function() { this._graph = null; };
Node.prototype.connectEdges = function() {
    if (!this._graph) { return; }
    var graph = this._graph;
    this.getEdges().forEach(function(edge) {
        // Check if the edge exists before creating it.
        if (graph.getEdge(this.getId(), edge.getTargetId()) === edge.getEdgeType()) { return; }

        this._connectEdgesSpanContainer();
        this._connectEdgesSequence();
        // console.log("LINK EDGE nodeId: " + this.getId() + ", targetId: " + edge.getTargetId() + ", type: " + edge.getEdgeType() + ".");
        graph.setEdge(this.getId(), edge.getTargetId(), edge.getEdgeType());
    }, this);
};
// If node is a span container create edges to all it's children.
// This allows children to quickly reference their parent nodes.
// Child nodes may not have edges in the graphImpl yet so create edges
// based only on the edges array in the node.
Node.prototype._connectEdgesSpanContainer = function() {
    var graph = this._graph;
    var firstEdge = this.getFirstEdgeByType('first');
    var lastEdge = this.getFirstEdgeByType('last');

    if (this.hasTraitSpanContainer() && firstEdge && lastEdge) {
        var linkNode = graph.getNodeById(firstEdge.getTargetId());
        var lastNode = graph.getNodeById(lastEdge.getTargetId());
        while (true) {
            if (!linkNode) {
                // node has dead-end edges and graph is invalid. abort linking
                // nodes to parent
                break;
            }
            // console.log("Node._connectEdgesSpanContainer: Checking node '" + linkNode.getId() + "', type: '" + linkNode.getType() + "'.");
            // Don't create the edge if it already exists
            if (!graph.getEdge(this.getId(), linkNode.getId())) {
                // console.log("LINK EDGE nodeId: " + this.getId() + ", targetId: " + linkNode.getId() + ", type: child.");
                graph.setEdge(this.getId(), linkNode.getId(), 'child');
            }
            if (linkNode === lastNode) {
                // console.log("Node._connectEdgesSpanContainer: LinkNode === LastNode.");
                break;
            }
            try {
                linkNode = graph.getNodeById(linkNode.getFirstEdgeByType('next').getTargetId());
            } catch (err) {
                // Something went wrong, maybe this sequence is messed up?
                // * Doesn't have a next edge.
                // * Last edge is incorrect.
                // console.error("There was an issue linking children for node '" + this.getId() + "'.");
                break;
            }
        }
    }
};
Node.prototype._connectEdgesSequence = function() {
    var self = this;
    if (!self.hasTraitSequence()) { return; }
    // Sequence (first)
    // Handled by the generic edge loop above.
    // Sequence (middle)
    // A -> B
    // A C -> B
    // A -> C -> B
    if (self.hasNext() && !self.hasPrevious() &&
        self.next().hasPrevious() &&
        self.next().previous() !== self
    ) {
        var prevNode = self.next().previous();
        prevNode.removeEdge(prevNode.getFirstEdgeByType('next'));
        prevNode.addEdge(self.getId(), self.getType(), 'next');
        // Next node is already added via the generic edge loop above.
        // Set parent edges based on this node's neighbors
        var prevInEdgeImpls = prevNode._getEdgesImplByLabels('in', ['first', 'last', 'child']);
        var nextInEdgeImpls = self.next()._getEdgesImplByLabels('in', ['first', 'last', 'child']);
        // Matching parents between the prev and next nodes will be applied to this node.
        prevInEdgeImpls.forEach(function(prevInEdgeImpl) {
            nextInEdgeImpls.forEach(function(nextInEdgeImpl) {
                if (prevInEdgeImpl.v == nextInEdgeImpl.v) {
                    var prevParentNode = self._graph.getNodeById(prevInEdgeImpl.v);
                    // console.log("LINK EDGE nodeId: " + prevParentNode.getId() + ", targetId: " + self.getId() + ", type: child.");
                    self._graph.setEdge(prevParentNode.getId(), self.getId(), 'child');
                }
            });
        });
    }
    // Sequence (last)
    // Is this even possible? There are no edges to indicate that it is.
};
Node.prototype.removeEdge = function(aEdge) {
    if (!(aEdge instanceof Edge)) {
        throw Error("`Node.removeEdge` only accepts an instance of Edge.");
    }
    // console.log("REMOVE EDGE nodeId: " + this.getId() + ", targetId: " + aEdge.getTargetId() + ", targetType: " + aEdge.getTargetType() + ", edgeType: " + aEdge.getEdgeType() + ".");
    this._edges = this._edges.filter(function(edge) {
        var edgeNode = this._graph.getNodeById(edge.getTargetId());
        if (edgeNode) {
            // If the target node exists in the graph, remove the edge from the graphImpl.
            // console.log("UNLINK EDGE nodeId: " + this.getId() + ", targetId: " + edgeNode.getId() + ", type: " + edge.getEdgeType() + ".");
            this._graph.removeEdge(this.getId(), edgeNode.getId(), edge.getEdgeType());
        }

        // Only keep edges that don't match the one provided.
        return aEdge !== edge;
    }, this);
};
Node.prototype.removeEdges = function() {
    var self = this;
    self._removeEdgesSequence();
    // Remove the standard edges
    self.getEdges().forEach(function(edge) {
        self.removeEdge(edge);
    });
};
Node.prototype._removeEdgesSequence = function() {
    // Sequence (first)
    // Handled by the generic loop above.
    // Sequence (middle)
    // A -> C -> B
    // A C B
    // A -> B
    if (this.hasNext() && this.hasPrevious()) {
        var prevNode = this.previous();
        var nextNode = this.next();
        this.removeEdge(this.getFirstEdgeByType('next'));
        prevNode.removeEdge(prevNode.getFirstEdgeByType('next'));
        prevNode.addEdge(nextNode.getId(), nextNode.getType(), 'next');
        // Parent edges will be broken by removing the node from graphlib.
    }
    // Sequence (last)
    // Nothing to do here.
};

// Span/SpanContainer trait functions
Node.prototype.getText = function() {
    var isSpan = this.hasTraitSpan(), isSpanContainer = this.hasTraitSpanContainer();
    if (!isSpan && !isSpanContainer) {
        throw Error("Calling `getText` on a Node that does not have the `span` or `spanContainer` trait.");
    }
    return this._graph.getContent().slice(this.getStartIndex(), this.getEndIndex());
};

function getSpanContainerIndex(node, isStart) {
    var childNode = isStart ? node.getFirst() : node.getLast();
    var idx = -1;

    if (childNode && isStart) {
        idx = childNode.getStartIndex();
    } else if (childNode) {
        idx =  childNode.getEndIndex();
    }

    return idx;
}
Node.prototype._getIndex = function(isStart) {
    if (this.hasTraitSpan()) {
        var start = this.getFirstProp('start');
        return isStart ? start : start + this.getFirstProp('length');
    }
    if (this.hasTraitSpanContainer()) {
        return getSpanContainerIndex(this, isStart);
    } else {
        // Find all edges that are not the same type as the current node.
        // And determine which one has the proper index.
        var self = this;
        var reduced = this.getEdges().filter(function(edge) {
            return edge.getTargetType() !== self.getType();
        }).reduce(function(idx, edge) {
            var node = self._graph.getNodeById(edge.getTargetId());
            var newIndex = isStart ? node.getStartIndex() : node.getEndIndex();
            if (isStart) {
                if (newIndex < idx) { return newIndex; }
            } else {
                if (idx < newIndex) { return newIndex; }
            }
            return idx;
        }, isStart ? Infinity : Number.NEGATIVE_INFINITY);
        // Replace Infinity with -1
        reduced = reduced === Infinity                 ? -1 : reduced;
        reduced = reduced === Number.NEGATIVE_INFINITY ? -1 : reduced;
        return reduced;
    }
};
// The value returned is INclusive to the annotation.
Node.prototype.getStartIndex = function() {
    return this._getIndex(true);
};
// The value returned is EXclusive to the annotation.
Node.prototype.getEndIndex = function() {
    return this._getIndex();
};

// Sequence trait functions
Node.prototype.hasNext = function() {
    if (!this.hasTraitSequence()) { return false; }
    return !!this.getFirstEdgeByType('next');
};
Node.prototype.hasPrevious = function() {
    if (!this.hasTraitSequence()) { return false; }
    // Special case, there will not be an explicit `previous` edge.
    // This library assumes a sequence node will only ever have one incoming `next` edge.
    var previousImplEdges = this._getEdgesImplByLabels('in', ['next']);
    return previousImplEdges.length === 1;
};
Node.prototype.next = function() {
    if (!this.hasTraitSequence()) { throw Error("Calling `next` on a Node that does not have the `sequence` trait."); }
    return this._graph.getNodeById(this.getFirstEdgeByType('next').getTargetId());
};
Node.prototype.previous = function() {
    if (!this.hasTraitSequence()) { throw Error("Calling `previous` on a Node that does not have the `sequence` trait."); }
    // Special case, there will not be an explicit `previous` edge.
    // This library assumes a sequence node will only ever have one incoming `next` edge.
    var previousImplEdges = this._getEdgesImplByLabels('in', ['next']);
    if (previousImplEdges.length !== 1) { return undefined; }
    return this._graph.getNodeById(previousImplEdges[0].v);
};
Node.prototype._getEdgesImplByLabels = function(direction, labels)  {
    var graphImpl = this._graph._graphImpl;
    return graphImpl[direction + 'Edges'](this._id).filter(function(edgeImpl) {
        return labels.indexOf(graphImpl.edge(edgeImpl.v, edgeImpl.w)) !== -1;
    });
};
// Breadth-first search for parents of a given node type.
Node.prototype._getParentsOfType = function(fnName, nodeType, stopOnFirst) {
    if (!this.hasTraitSequence()) { throw Error("Calling `" + fnName + "` on a Node that does not have the `sequence` trait."); }
    if (this._graph.getNodeTypes().indexOf(nodeType) === -1) {
        throw Error("`Node." + fnName + "`: '" + nodeType + "' is not a node type available in the graph.");
    }
    var currentNode, parentEdges, i, matchingNodes = [], self = this;
    // Store nodes that need to be visited in the currentNodes array.
    var currentNodes = this._getEdgesImplByLabels('in', ['child']).map(function(edgeImpl) {
        return self._graph.getNodeById(edgeImpl.v);
    });
    while (true) {
        // If nothing is left in the array, we didn't find a parent node.
        if (currentNodes.length === 0) { break; }
        currentNode = currentNodes.pop();
        // Found the parent, return it.
        if (currentNode.getType() === nodeType) {
            if (stopOnFirst) { return currentNode; }
            else { matchingNodes.push(currentNode); }
        }
        // Node was not the right type, check it's parents.
        parentEdges = currentNode._getEdgesImplByLabels('in', ['child']);
        for (i = 0; i < parentEdges.length; i++) {
            currentNodes.push(self._graph.getNodeById(parentEdges[i].v));
        }
    }
    return matchingNodes;
};
Node.prototype.getFirstParentOfType = function(nodeType) {
    return this._getParentsOfType('getFirstParentOfType', nodeType, true);
};
Node.prototype.getParentsOfType = function(nodeType) {
    return this._getParentsOfType('getParentsOfType', nodeType);
};

// SpanContainer trait functions
Node.prototype.getFirst = function() {
    if (!this.hasTraitSpanContainer()) { throw Error("Calling `getFirst` on a Node that does not have the `span container` trait."); }
    var firstEdge = this.getFirstEdgeByType('first');
    if (!firstEdge) { return undefined; }
    return this._graph.getNodeById(firstEdge.getTargetId());
};
Node.prototype.getLast = function() {
    if (!this.hasTraitSpanContainer()) { throw Error("Calling `getLast` on a Node that does not have the `span container` trait."); }
    var lastEdge = this.getFirstEdgeByType('last');
    if (!lastEdge) { return undefined; }
    return this._graph.getNodeById(lastEdge.getTargetId());
};

module.exports = Node;
