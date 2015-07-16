var constants = require('./constants.js');
var print = require('util').print;

function IdGeneratorComponent(type, ext) {
	this.type = type;
}

IdGeneratorComponent.prototype.toString = function() {
	switch(this.type) {
		case "prop":
			return "{prop:" + this.delimiter + ":" + this.name + "}";
		case "seq":
			return "{seq}";
		case "random":
			return "{random:" + this.length + "/" + this.base + "}";
		case "static":
			return this.value;
		case "edge":
			return "{edge:" + this.delimiter + ":" + this.name + "}";
	}
};

function IdGenerator(components) {
	this.components = components.slice();
}

IdGenerator.prototype.toString = function() {
	return this.components.join("");
};

function prop (name, delimiter) {
	var c = new IdGeneratorComponent("prop");
	c.name = name;
	c.delimiter = delimiter !== undefined ? delimiter : constants.ID_PROP_DEFAULT_DELIMITER;
	return c;
}

function sequential () {
	return new IdGeneratorComponent("seq");
}

function random (length, base) {
	var c = new IdGeneratorComponent("random");
	c.length = length !== undefined ? length : constants.ID_RANDOM_DEFAULT_LENGTH;
	c.base = base !== undefined ? base : constants.ID_RANDOM_DEFAULT_BASE;
	return c;
}

function staticValue (value) {
	var c = new IdGeneratorComponent("static");
	c.value = value;
	return c;
}

function edge(name, delimiter) {
	var c = new IdGeneratorComponent("edge");
	c.name = name;
	c.delimiter = delimiter !== undefined ? delimiter : constants.ID_EDGE_DEFAULT_DELIMITER;
	return c;
}

function generator(components) {
	return new IdGenerator(components);
}

var staticRegex = /^[^\{}]+/;
var seqRegex = /^\{seq}/;
var randomRegex = /^\{random(?::([0-9]+)(?:\/([0-9]+))?)?}/;
var propRegex = /^\{prop(?::([^:{}]*))?:([^:{}]+)}/;
var edgeRegex = /^\{edge(?::([^:{}]*))?:([^:{}]+)}/;

function parse(pattern) {
	var components = [];
	var offset = 0;
	while (offset < pattern.length) {
		var currTarget = pattern.slice(offset);
		var result = staticRegex.exec(currTarget);
		if (result) {
			offset += result[0].length;
			components.push(staticValue(result[0]));
			continue;
		}
		result = seqRegex.exec(currTarget);
		if (result) {
			offset += result[0].length;
			components.push(sequential());
			continue;
		}
		result = randomRegex.exec(currTarget);
		if (result) {
			offset += result[0].length;
			components.push(random(result[1], result[2]));
			continue;
		}
		result = propRegex.exec(currTarget);
		if (result) {
			offset += result[0].length;
			components.push(prop(result[2], result[1]));
			continue;
		}
		result = edgeRegex.exec(currTarget);
		if (result) {
			offset += result[0].length;
			components.push(edge(result[2], result[1]));
			continue;
		}
		// if we get there, this is an invalid pattern
		throw Error("Unable to parse idGenerator pattern '" + pattern + "', beginning with the text '" + currTarget + "'.");
	}
	var idGenerator = new IdGenerator(components);
	return idGenerator;
}

module.exports.generator = generator;
module.exports.parse = parse;
module.exports.prop = prop;
module.exports.sequential = sequential;
module.exports.random = random;
module.exports.staticValue = staticValue;
module.exports.edge = edge;
