// CONSTANTS
var util = require("../util.js");
var nodeType = require("./nodeType.js");
var constants = require("./constants.js");
var xml = require("./xml.js");

function PagiSchema(id, parentSchemas, nodeTypeMap) {
	this.id = id;
	this.parentSchemas = parentSchemas;
	this.nodeTypeMap = nodeTypeMap;
	util.doFreeze(this);
}

function SchemaBuilder(artificial) {
	this.artificial = artificial;
	this.parentSchemas = [];
	this.declaredNodeTypeMap = {};
	this.nodeTypeExtensionMap = {};
}

SchemaBuilder.prototype.withId = function(id) {
	this.id = id;
	return this;
};

SchemaBuilder.prototype.withDescription = function(description) {
	this.description = description;
	return this;
};

SchemaBuilder.prototype.withParent = function(parentSchema) {
	this.parentSchemas.push(parentSchema);
	return this;
};

SchemaBuilder.prototype.withNodeType = function(nodeType) {
	this.declaredNodeTypeMap[nodeType.name] = nodeType;
	return this;
};

SchemaBuilder.prototype.withNodeTypeExtension = function(extension) {
	this.nodeTypeExtensionMap[extension.name] = extension;
	return this;
};

SchemaBuilder.prototype.build = function() {
	if (this.id === undefined) {
		throw Error("No id supplied for SchemaBuilder.");
	}
	var self = this;
	(function() {
		for (var i = 0; i < self.parentSchemas.length; i++)
		{
			var parentSchema = self.parentSchemas[i];
			var parentNodeTypeKeys = Object.keys(parentSchema.nodeTypeMap);
			for (var j = 0; j < parentNodeTypeKeys.length; j++)
			{
				var key = parentNodeTypeKeys[j];
				self.declaredNodeTypeMap[key] = nodeType.mergeNodes(parentSchema.nodeTypeMap[key], self.declaredNodeTypeMap[key]);
			}
		}
	})();
	(function() {
		var extensionNames = Object.keys(self.nodeTypeExtensionMap);
		for (var i2 = 0; i2 < extensionNames.length; i2++) {
			var extensionName = extensionNames[i2];
			var parentNodeType = self.declaredNodeTypeMap[extensionName];
			if (!parentNodeType) {
				throw Error("Attempting to extend node type " + extensionName + " but it does not exist in any of the parent schemas.");
			}
			var extensionBuilder = self.nodeTypeExtensionMap[extensionName];
			extensionBuilder.withParent(parentNodeType);
			self.declaredNodeTypeMap[extensionName] = extensionBuilder.build();
		}
	})();

	return new PagiSchema(this.id, this.parentSchemas, this.declaredNodeTypeMap);
};

SchemaBuilder.prototype.createNodeTypeBuilder = nodeType.createBuilder;

module.exports.createBuilder = function() {
	return new SchemaBuilder(false);
};

module.exports.ValueType = constants.ValueType;
module.exports.createParser = xml.createParser;
