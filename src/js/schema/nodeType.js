var util = require("../util.js");
var propertySpec = require("./propertySpec.js");
var edgeSpec = require("./edgeSpec.js");
var constants = require("./constants.js");

function NodeType(name, idGeneratorPattern, description, propertySpecMap, edgeSpecMap, traitSpan, traitSequence, traitSpanContainer, spanType) {
	this.name = name;
	this.idGeneratorPattern = idGeneratorPattern;
	this.description = description;
	this.propertySpecMap = propertySpecMap;
	this.edgeSpecMap = edgeSpecMap;
	this.traitSpan = traitSpan;
	this.traitSequence = traitSequence;
	this.traitSpanContainer = traitSpanContainer;
	this.spanType = spanType;
	util.doFreeze(this);
}

function NodeTypeBuilder() {
	this.propertySpecMap = {};
	this.edgeSpecMap = {};
	this.traitSpan = false;
	this.traitSequence = false;
	this.traitSpanContainer = false;
}

NodeTypeBuilder.prototype.withParent = function(parent) {
	this.withName(parent.name);
	this.withIdGeneratorPattern(parent.idGeneratorPattern);
	this.withDescription(parent.description);
	this.traitSpan = parent.traitSpan;
	this.traitSequence = parent.traitSequence;
	this.traitSpanContainer = parent.traitSpanContainer;
	this.spanType = parent.spanType;

	var self = this;
	mergeParentSpecs(this.propertySpecMap, parent.propertySpecMap, function(key, thisSpec, parentSpec) {
		if (thisSpec) {
			throw Error("Attempting to extend nodeType " + parent.name + " by adding property spec " + key + " when it is already defined in the parent.");
		}
		self.withPropertySpec(parentSpec);
	});
	mergeParentSpecs(this.edgeSpecMap, parent.edgeSpecMap, function(key, thisSpec, parentSpec) {
		if (thisSpec) {
			throw Error("Attempting to extend nodeType " + parent.name + " by adding edge spec " + key + " when it is already defined in the parent.");
		}
		self.withEdgeSpec(parentSpec);
	});
};

/**
 * For each key in parentMap, finds appropriate (if existing) key in thisMap, and passes both, along with the name of
 * the key, to callback.
 * @param thisMap
 * @param parentMap
 * @param callback
 */
function mergeParentSpecs(thisMap, parentMap, callback) {
	var keys = Object.keys(parentMap);
	for (var i = 0; i < keys.length; i++) {
		var key = keys[i];
		callback(key, thisMap[key], parentMap[key]);
	}
}

NodeTypeBuilder.prototype.withName = function(name) {
	this.name = name;
	return this;
};

NodeTypeBuilder.prototype.withIdGeneratorPattern = function(pattern) {
	this.idGeneratorPattern = pattern;
};

NodeTypeBuilder.prototype.withDescription = function(description) {
	this.description = description;
	return this;
};

NodeTypeBuilder.prototype.withPropertySpec = function(propertySpec) {
	this.propertySpecMap[propertySpec.name] = propertySpec;
	return this;
};

NodeTypeBuilder.prototype.withEdgeSpec = function(edgeSpec) {
	this.edgeSpecMap[edgeSpec.name] = edgeSpec;
	return this;
};

NodeTypeBuilder.prototype.asSpan = function() {
	this.traitSpan = true;
	var startPropSpec = this.createPropertySpecBuilder()
		.withName(constants.TRAIT_SPAN_START_PROP)
		.withValueType(constants.ValueType.INTEGER)
		.withMinArity(1)
		.withMaxArity(1)
		.withIntegerRestrictions(0, undefined)
		.build();
	var lengthPropSpec = this.createPropertySpecBuilder()
		.withName(constants.TRAIT_SPAN_LENGTH_PROP)
		.withValueType(constants.ValueType.INTEGER)
		.withMinArity(1)
		.withMaxArity(1)
		.withIntegerRestrictions(0, undefined)
		.build();
	this.withPropertySpec(startPropSpec);
	this.withPropertySpec(lengthPropSpec);
	return this;
};

NodeTypeBuilder.prototype.asSequence = function() {
	this.traitSequence = true;
	var nextEdgeSpec = this.createEdgeSpecBuilder()
		.withName(constants.TRAIT_SEQUENCE_NEXT_EDGE)
		.withMinArity(0)
		.withMaxArity(1)
		.withTargetNodeType(this.name)
		.build();
	this.withEdgeSpec(nextEdgeSpec);
	return this;
};

NodeTypeBuilder.prototype.asSpanContainer = function(spanType) {
	this.traitSpanContainer = true;
	this.spanType = spanType;
	var firstEdgeSpec = this.createEdgeSpecBuilder()
		.withName(constants.TRAIT_SPAN_CONTAINER_FIRST_EDGE)
		.withMinArity(1)
		.withMaxArity(1)
		.withTargetNodeType(spanType)
		.build();
	var lastEdgeSpec = this.createEdgeSpecBuilder()
		.withName(constants.TRAIT_SPAN_CONTAINER_LAST_EDGE)
		.withMinArity(1)
		.withMaxArity(1)
		.withTargetNodeType(spanType)
		.build();
	this.withEdgeSpec(firstEdgeSpec);
	this.withEdgeSpec(lastEdgeSpec);
	return this;
};

NodeTypeBuilder.prototype.createPropertySpecBuilder = propertySpec.createBuilder;
NodeTypeBuilder.prototype.createEdgeSpecBuilder = edgeSpec.createBuilder;

NodeTypeBuilder.prototype.build = function() {
	if (this.name === undefined) {
		throw Error("No name supplied for NodeType.");
	}
	return new NodeType(this.name, this.idGeneratorPattern, this.description, Object.freeze(this.propertySpecMap), Object.freeze(this.edgeSpecMap),
	                    this.traitSpan, this.traitSequence, this.traitSpanContainer, this.spanType);
};

module.exports.createBuilder = function() {
	return new NodeTypeBuilder();
};
module.exports.mergeNodes = function(node1, node2) {
	if (!node2) {
		return node1;
	}
	if (!node1) {
		return node2;
	}

	var nodeTypeBuilder = new NodeTypeBuilder();
	nodeTypeBuilder.withName(node1.name);
	if (node1.idGeneratorPattern.toString() != node2.idGeneratorPattern.toString()) {
		throw Error("Failed to merge nodeType " + node1 + " due to different idGeneratorPatterns.");
	}
	nodeTypeBuilder.withIdGeneratorPattern(node1.idGeneratorPattern);
	nodeTypeBuilder.withDescription(node1.description);
	nodeTypeBuilder.traitSpan = node1.traitSpan;
	nodeTypeBuilder.traitSequence = node1.traitSequence;
	nodeTypeBuilder.traitSpanContainer = node1.traitSpanContainer;
	nodeTypeBuilder.spanType = node1.spanType;

	function addPropertySpecs(node) {
		for (var key in node.propertySpecMap) {
			if (node.propertySpecMap.hasOwnProperty(key)) {
				nodeTypeBuilder.withPropertySpec(node.propertySpecMap[key]);
			}
		}
	}
	addPropertySpecs(node1);
	addPropertySpecs(node2);

	function addEdgeSpecs(node) {
		for (var key in node.edgeSpecMap) {
			if (node.edgeSpecMap.hasOwnProperty(key)) {
				nodeTypeBuilder.withEdgeSpec(node.edgeSpecMap[key]);
			}
		}
	}
	addEdgeSpecs(node1);
	addEdgeSpecs(node2);

	return nodeTypeBuilder.build();
};
