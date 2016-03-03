var util = require("../util.js");
var constants = require("./constants.js");

function PropertySpec(name, readableName, description, valueType, minArity, maxArity, restrictions) {
	this.name = name;
	this.readableName = readableName;
	this.description = description;
	this.valueType = valueType;
	this.minArity = minArity;
	this.maxArity = maxArity;
	this.restrictions = restrictions;
	util.doFreeze(this);
}

function IntegerRestrictions(minRange, maxRange) {
	this.minRange = minRange === undefined ? constants.INTEGER_DEFAULT_MIN_RANGE : minRange;
	this.maxRange = maxRange === undefined ? constants.INTEGER_DEFAULT_MAX_RANGE : maxRange;
	util.doFreeze(this);
}

function FloatRestrictions(minRange, maxRange) {
	this.minRange = minRange === undefined ? constants.FLOAT_DEFAULT_MIN_RANGE : minRange;
	this.maxRange = maxRange === undefined ? constants.FLOAT_DEFAULT_MAX_RANGE : maxRange;
	util.doFreeze(this);
}

function StringRestrictions(items) {
	this.items = items;
	util.doFreeze(this);
}

function PropertySpecBuilder() {
	this.minArity = constants.DEFAULT_MIN_ARITY;
	this.maxArity = constants.DEFAULT_MAX_ARITY;
}

PropertySpecBuilder.prototype.withName = function(name) {
	this.name = name;
	return this;
};

PropertySpecBuilder.prototype.withReadableName = function(readableName) {
	this.readableName = readableName;
	return this;
};

PropertySpecBuilder.prototype.withDescription = function(description) {
	this.description = description;
	return this;
};

PropertySpecBuilder.prototype.withValueType = function(valueType) {
	this.valueType = valueType;
	return this;
};

PropertySpecBuilder.prototype.withMinArity = function(minArity) {
	this.minArity = minArity;
	return this;
};

PropertySpecBuilder.prototype.withMaxArity = function(maxArity) {
	this.maxArity = maxArity;
	return this;
};

PropertySpecBuilder.prototype.withIntegerRestrictions = function(minRange, maxRange) {
	this.restrictions = new IntegerRestrictions(minRange, maxRange);
	return this;
};

PropertySpecBuilder.prototype.withFloatRestrictions = function(minRange, maxRange) {
	this.restrictions = new FloatRestrictions(minRange, maxRange);
	return this;
};

PropertySpecBuilder.prototype.withEnumItem = function(item) {
	this.items = this.items || [];
	this.items.push(item);
	return this;
};

PropertySpecBuilder.prototype.build = function() {
	if (this.name === undefined) {
		throw Error("No name supplied for PropertySpec.");
	}
	if (this.valueType === undefined) {
		throw Error("No value type supplied for PropertySpec '" + this.name + "'.");
	}
	if (this.minArity < 0) {
		throw Error("minArity [" + this.minArity + "] must be greater than or equal to 0 for PropertySpec '" + this.name + "'.");
	}
	if (this.maxArity >= 0 && this.maxArity < this.minArity) {
		throw Error("minArity [" + this.minArity + "] must be less than or equal to maxArity [" + this.maxArity + "] for PropertySpec '" + this.name + "'.");
	}

	if (this.restrictions === undefined) {
		switch (this.valueType) {
			case constants.ValueType.INTEGER:
				this.restrictions = new IntegerRestrictions(constants.INTEGER_DEFAULT_MIN_RANGE, constants.INTEGER_DEFAULT_MAX_RANGE);
				break;
			case constants.ValueType.FLOAT:
				this.restrictions = new FloatRestrictions(constants.FLOAT_DEFAULT_MIN_RANGE, constants.FLOAT_DEFAULT_MAX_RANGE);
				break;
			case constants.ValueType.STRING:
				// if this.items is undefined, then there are no restrictions
				this.restrictions = new StringRestrictions(this.items);
				break;
		}
	}

	return new PropertySpec(this.name, this.readableName, this.description, this.valueType, this.minArity, this.maxArity, this.restrictions);
};

module.exports.createBuilder = function() {
	return new PropertySpecBuilder();
};
