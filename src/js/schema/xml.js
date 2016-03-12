var schema = require("./schema.js");
var sax = require("sax");
var print = require("util").print;
var idGenerator = require("./idGenerator.js");
var constants = require("./constants.js");
var Q = require('q');

function looseParseInt(value) {
	return value === undefined ? value : parseInt(value);
}

function looseParseFloat(value) {
	return value === undefined ? value : parseFloat(value);
}

function parseMinArity(value) {
	return looseParseInt(value);
}

function parseMaxArity(value) {
	return value === "unbounded" ? constants.UNBOUNDED_ARITY : looseParseInt(value);
}

/**
 * Calls a locator, providing the parser for it and returns the promise that it returns.
 * @param id
 * @param locator
 */
function callLocator(id, locator) {
	return locator(id, function(readableStream) {
		return doParse(readableStream, locator);
	});
}

/**
 * Returns a promise that contains the schema object. The 'locator' callback is "optional", and should be a function
 * that takes `id` and `parser`. It should look up a schema by `id`, and return a promise, which will be fulfilled by
 * the schema object. It may, if required by the implementation, leverage the `parser` to parse out a stream. That
 * `parser` will leverage the same locator callback. If no schema is located with id `id`, then `undefined` should be
 * returned.
 * @param readableStream
 * @param locator
 */
function doParse(readableStream, locator) {
	var deferred = Q.defer();
	var schemaBuilder = schema.createBuilder();
	var nodeBuilder = null;
	var propSpecBuilder = null;
	var edgeSpecBuilder = null;
	var delegatePromises = [];

	var streamParser = sax.createStream(true, {xmlns: true, position: true});
	streamParser.on("opentag", function (tag) {
		var valueType;
		switch(tag.name) {
			case "pagis":
				schemaBuilder.withId(tag.attributes.id.value);
				break;
			case "extends":
				var parentId = tag.attributes.id.value;
				var p = callLocator(parentId, locator).then(function(schema) {
					schemaBuilder.withParent(schema);
				});
				delegatePromises.push(p);
				break;
			case "nodeTypeExtension":
				nodeBuilder = schemaBuilder.createNodeTypeBuilder().withName(tag.attributes.extends.value);
				break;
			case "nodeType":
				nodeBuilder = schemaBuilder.createNodeTypeBuilder().withName(tag.attributes.name.value);
				var pattern = tag.attributes.idGenerator.value;
				var nodeIdGenerator = idGenerator.parse(pattern);
				nodeBuilder.withIdGeneratorPattern(nodeIdGenerator);
				break;
			case "span":
				nodeBuilder.asSpan();
				break;
			case "sequence":
				nodeBuilder.asSequence();
				break;
			case "spanContainer":
				var spanType = tag.attributes.spanType.value;
				nodeBuilder.asSpanContainer(spanType);
				break;
			case "enumProperty":
			case "stringProperty":
				valueType = valueType || schema.ValueType.STRING;
			case "floatProperty":
				valueType = valueType || schema.ValueType.FLOAT;
			case "booleanProperty":
				valueType = valueType || schema.ValueType.BOOLEAN;
			case "integerProperty":
				valueType = valueType || schema.ValueType.INTEGER;

				if (nodeBuilder)
				{
					propSpecBuilder = nodeBuilder.createPropertySpecBuilder().withName(tag.attributes.name.value).withValueType(valueType);
					if (tag.attributes.minArity)
					{
						propSpecBuilder.withMinArity(parseMinArity(tag.attributes.minArity.value));
					}
					if (tag.attributes.maxArity)
					{
						propSpecBuilder.withMaxArity(parseMaxArity(tag.attributes.maxArity.value));
					}
					if (valueType === schema.ValueType.INTEGER || valueType === schema.ValueType.FLOAT)
					{
						var minRange;
						var maxRange;
						if (tag.attributes.minRange)
						{
							minRange = tag.attributes.minRange.value;
						}
						if (tag.attributes.maxRange)
						{
							maxRange = tag.attributes.maxRange.value;
						}
						if (valueType === schema.ValueType.INTEGER)
						{
							propSpecBuilder.withIntegerRestrictions(looseParseInt(minRange), looseParseInt(maxRange));
						}
						else if (valueType === schema.ValueType.FLOAT)
						{
							propSpecBuilder.withFloatRestrictions(looseParseFloat(minRange), looseParseFloat(maxRange));
						}
					}
				}
				break;
			case "edgeType":
				if (nodeBuilder)
				{
					edgeSpecBuilder = nodeBuilder.createEdgeSpecBuilder().withName(tag.attributes.name.value);
					if (tag.attributes.minArity)
					{
						edgeSpecBuilder.withMinArity(parseMinArity(tag.attributes.minArity.value));
					}
					if (tag.attributes.maxArity)
					{
						edgeSpecBuilder.withMaxArity(parseMaxArity(tag.attributes.maxArity.value));
					}
					if (tag.attributes.targetMinArity)
					{
						edgeSpecBuilder.withTargetMinArity(parseMinArity(tag.attributes.targetMinArity.value));
					}
					if (tag.attributes.targetMaxArity)
					{
						edgeSpecBuilder.withTargetMaxArity(parseMaxArity(tag.attributes.targetMaxArity.value));
					}
					if (tag.attributes.targetNodeType)
					{
						edgeSpecBuilder.withTargetNodeType(tag.attributes.targetNodeType.value);
					}
				}
				break;
			case "item":
				if (propSpecBuilder)
				{
					propSpecBuilder.withEnumItem(tag.attributes.name.value);
				}
				break;
			case "targetNodeType":
				if (edgeSpecBuilder)
				{
					edgeSpecBuilder.withTargetNodeType(tag.attributes.name.value);
				}
				break;
		}
	});
	streamParser.on("closetag", function(tagName) {
		switch(tagName) {
			case "pagis":
				break;
			case "nodeTypeExtension":
				if (nodeBuilder)
				{
					schemaBuilder.withNodeTypeExtension(nodeBuilder);
					nodeBuilder = null;
				}
				break;
			case "nodeType":
				if (nodeBuilder)
				{
					schemaBuilder.withNodeType(nodeBuilder.build());
					nodeBuilder = null;
				}
				break;
			case "enumProperty":
			case "stringProperty":
			case "floatProperty":
			case "booleanProperty":
			case "integerProperty":
				if (propSpecBuilder)
				{
					nodeBuilder.withPropertySpec(propSpecBuilder.build());
					propSpecBuilder = null;
				}
				break;
			case "edgeType":
				if (edgeSpecBuilder)
				{
					nodeBuilder.withEdgeSpec(edgeSpecBuilder.build());
					edgeSpecBuilder = null;
				}
				break;
		}
	});
	streamParser.on("end", function() {
		Q.allSettled(delegatePromises).then(function() {
			deferred.resolve(schemaBuilder.build());
		}).catch(function(err) {
			deferred.reject(err);
		});
	});
	streamParser.on("error", function(err) {
		readableStream.pause();
		readableStream.unpipe(streamParser);
		deferred.reject(err);
	});
	try {
        readableStream.pipe(streamParser);
	} catch (e) {
		throw Error("Could not parse stream " + readableStream.id + "..." + e);
	}
	return deferred.promise;
}

module.exports.createParser = function(locator) {
	return function(stream) {
		return doParse(stream, locator);
	};
};
