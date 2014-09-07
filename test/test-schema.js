var fs = require('fs');

var schemaTestRoot = 'build/test-suite/schema/';

function TestSchema(id, simpleName) {
  var xmlTestRoot = schemaTestRoot + 'def/';
  var flatTestRoot = schemaTestRoot + 'flag/';

  this.id = id;
  this.simpleName = simpleName;

  /**
   * Returns a ReadableStream containing the schema xml.
   */
  this.getXmlStream = function() {
    return fs.createReadStream(xmlTestRoot + this.simpleName + ".xml");
  }

  /**
   * Returns a string containing the flat representation.
   */
  this.getFlatRepresentation = function() {
    return fs.readFileSync(flatTestRoot + this.simpleName + ".txt", {encoding: 'utf8'});
  }

  /**
   * Returns a fully parsed schema object.
   */
  this.getParsed = function() {
    throw "Unsupported Operation";
  }
}

var lines = fs.readFileSync(schemaTestRoot + "full.list", {encoding: 'utf8'}).split('\n');

var schemas = lines.map(function(line) {
  var parts = line.split(" ");
  if (parts.length < 2) {
    return undefined;
  } else {
    return new TestSchema(parts[0], parts[1]);
  }
}).filter(function(schema) {
  return schema != undefined;
});

module.exports.fullList = schemas;
module.exports.locator = undefined; // TODO - add the locator in here

