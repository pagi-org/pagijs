var fs = require('fs');
var util = require('../../src/js/util.js');
var pagi = {
    schema: require('../../src/js/schema/schema.js')
};
var print = require('util').print;
var sprintf = require('sprintf-js').sprintf;
var q = require("q");


var schemaTestRoot = 'build/test-suite/schema/';

function TestSchema(id, simpleName) {
  var xmlTestRoot = schemaTestRoot + 'def/';
  var flatTestRoot = schemaTestRoot + 'flat/';

  this.id = id;
  this.simpleName = simpleName;

  /**
   * Returns a ReadableStream containing the schema xml.
   */
  this.getXmlStream = function() {
    return fs.createReadStream(xmlTestRoot + this.simpleName + ".xml");
  };

  /**
   * Returns a string containing the flat representation.
   */
  this.getFlatRepresentation = function() {
    return fs.readFileSync(flatTestRoot + this.simpleName + ".txt", {encoding: 'utf8'});
  };

  /**
   * Returns a fully parsed schema object.
   */
  this.getParsed = function() {
      return schemaParser(this.getXmlStream());
  };

}
function maxArityString(value)
{
    return value < 0 ? "UNBOUNDED" : String(value);
}

function formatFloat(float)
{
	var result = sprintf("%.7e", float);
    result = result.replace(/e[+\-].$/, function(exp) {
	    var s = exp.substring(0, 2) + "0" + exp.substring(2, 3);
        return s;
    });
    return result;
}

function toFlatString(schema)
{
    var sb = new util.StringBuilder();
    sb.append(schema.id).append("\n");

    var forSorted = function (arr, appendCallback)
    {
        var newArr = arr.slice();
        newArr.sort().forEach(appendCallback);
    };
    var forSortedKeys = function (map, appendCallback)
    {
        var keys = Object.getOwnPropertyNames(map);
        keys.sort().forEach(appendCallback);
    };

    // EXTENDS section
    forSorted(schema.parentSchemas, function (parent)
    {
        sb.append("EXTENDS ").append(parent.id).append("\n");
    });


    // NODETYPE sections
    var appendNodeType = function (nodeTypeName)
    {
        var nodeType = schema.nodeTypeMap[nodeTypeName];
        sb.append("\n").append("NODETYPE ").append(nodeType.name).append(" ").append(nodeType.idGeneratorPattern);
        if (nodeType.traitSequence)
        {
            sb.append(" SEQUENCE");
        }
        if (nodeType.traitSpan)
        {
            sb.append(" SPAN");
        }
        if (nodeType.traitSpanContainer)
        {
            sb.append(" SPAN_CONTAINER ").append(nodeType.spanType)
        }
        sb.append("\n");
        var appendPropSpec = function (propSpecName)
        {
            var propSpec = nodeType.propertySpecMap[propSpecName];
            sb.append("PROP ")
                .append(propSpecName).append(" ")
                .append(propSpec.minArity).append(" ")
                .append(maxArityString(propSpec.maxArity)).append(" ")
                .append(propSpec.valueType.name);
            switch (propSpec.valueType)
            {
                case pagi.schema.ValueType.INTEGER:
                    sb.append(" ").append(propSpec.restrictions.minRange);
                    sb.append(" ").append(propSpec.restrictions.maxRange);
                    break;
                case pagi.schema.ValueType.FLOAT:
                    sb.append(" ").append(formatFloat(propSpec.restrictions.minRange));
                    sb.append(" ").append(formatFloat(propSpec.restrictions.maxRange));
                    break;
                case pagi.schema.ValueType.BOOLEAN:
                    // nothing interesting to do here
                    break;
                case pagi.schema.ValueType.STRING:
                    if (propSpec.restrictions && propSpec.restrictions.items)
                    {
                        forSorted(propSpec.restrictions.items, function (item)
                        {
                            sb.append(" ");
                            sb.append(item);
                        });
                    }
                    break;
            }
            sb.append("\n");
        };
        forSortedKeys(nodeType.propertySpecMap, appendPropSpec);

        var appendEdgeSpec = function (edgeSpecName)
        {
            var edgeSpec = nodeType.edgeSpecMap[edgeSpecName];
            sb.append("EDGE ");
            sb.append(edgeSpecName).append(" ");
            sb.append(edgeSpec.minArity).append(" ");
            sb.append(maxArityString(edgeSpec.maxArity)).append(" ");
            sb.append(edgeSpec.targetMinArity).append(" ");
            sb.append(maxArityString(edgeSpec.targetMaxArity));
            forSorted(edgeSpec.targetNodeTypes, function (targetType)
            {
                sb.append(" ").append(targetType);
            });
            sb.append("\n");
        };
        forSortedKeys(nodeType.edgeSpecMap, appendEdgeSpec);
    };
    forSortedKeys(schema.nodeTypeMap, appendNodeType);

    return sb.toString();
}

var lines = fs.readFileSync(schemaTestRoot + "full.list", {encoding: 'utf8'}).split('\n');

var schemas = lines.map(function(line) {
    var parts = line.split(" ");
    if (parts.length < 2)
    {
        return undefined;
    }
    else
    {
        return new TestSchema(parts[0], parts[1]);
    }
}).filter(function(schema) {
    return schema != undefined;
});

var schemaMap = {};

for (var i = 0; i < schemas.length; i++) {
    schemaMap[schemas[i].id] = schemas[i];
}

var locator = function (id, parser)
{
    var testSchema = schemaMap[id];
    return testSchema ? parser(testSchema.getXmlStream()) : Q.reject("No schema with id " + id + " is available.");
};

var schemaParser = pagi.schema.createParser(locator);

module.exports.fullList = schemas;
//module.exports.fullList = schemas.filter(function(it) {
//    print (it.simpleName);
//    return it.simpleName == "extTok";
//});
module.exports.toFlatString = toFlatString;
module.exports.locator = locator;

