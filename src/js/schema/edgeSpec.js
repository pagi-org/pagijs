var util = require("../util.js");
var constants = require("./constants.js");

function EdgeSpec(name, readableName, description, targetNodeTypes, minArity, maxArity, targetMinArity, targetMaxArity) {
	this.name = name;
	this.readableName = readableName;
	this.description = description;
	this.targetNodeTypes = targetNodeTypes;
	this.minArity = minArity;
	this.maxArity = maxArity;
	this.targetMinArity = targetMinArity;
	this.targetMaxArity = targetMaxArity;
	util.doFreeze(this);
}

function EdgeSpecBuilder() {
	this.targetNodeTypes = [];
	this.minArity = constants.DEFAULT_MIN_ARITY;
	this.maxArity = constants.DEFAULT_MAX_ARITY;
	this.targetMinArity = constants.DEFAULT_MIN_ARITY;
	this.targetMaxArity = constants.DEFAULT_MAX_ARITY;
}

EdgeSpecBuilder.prototype.withName = function(name) {
	this.name = name;
	return this;
};

EdgeSpecBuilder.prototype.withReadableName = function(readableName) {
	this.readableName = readableName;
	return this;
};

EdgeSpecBuilder.prototype.withDescription = function(description) {
	this.description = description;
	return this;
};

EdgeSpecBuilder.prototype.withTargetNodeType = function(targetNodeType) {
	this.targetNodeTypes.push(targetNodeType);
	return this;
};

EdgeSpecBuilder.prototype.withMinArity = function(minArity) {
	this.minArity = minArity;
	return this;
};

EdgeSpecBuilder.prototype.withMaxArity = function(maxArity) {
	this.maxArity = maxArity;
	return this;
};

EdgeSpecBuilder.prototype.withTargetMinArity = function(targetMinArity) {
	this.targetMinArity = targetMinArity;
	return this;
};

EdgeSpecBuilder.prototype.withTargetMaxArity = function(targetMaxArity) {
	this.targetMaxArity = targetMaxArity;
	return this;
};

EdgeSpecBuilder.prototype.build = function() {
	if (this.name === undefined) {
		throw Error("No name supplied for EdgeSpec.");
	}
	if (this.minArity < 0) {
		throw Error("minArity [" + this.minArity + "] must be greater than or equal to 0 for EdgeSpec '" + this.name + "'.");
	}
	if (this.maxArity >= 0 && this.maxArity < this.minArity) {
		throw Error("minArity [" + this.minArity + "] must be less than or equal to maxArity [" + this.maxArity + "] for EdgeSpec '" + this.name + "'.");
	}
	if (this.targetMinArity < 0) {
		throw Error("targetMinArity [" + this.targetMinArity + "] must be greater than or equal to 0 for EdgeSpec '" + this.name + "'.");
	}
	if (this.targetMaxArity >= 0 && this.targetMaxArity < this.targetMinArity) {
		throw Error("targetMinArity [" + this.targetMinArity + "] must be less than or equal to targetMaxArity [" + this.targetMaxArity + "] for EdgeSpec '" + this.name + "'.");
	}
	if (this.targetNodeTypes.length <= 0) {
		throw Error("At least 1 target node type must be specified for edge spec '" + this.name + "'.");
	}
	return new EdgeSpec(this.name, this.readableName, this.description, this.targetNodeTypes, this.minArity, this.maxArity, this.targetMinArity, this.targetMaxArity);
};

module.exports.createBuilder = function() {
	return new EdgeSpecBuilder();
};
