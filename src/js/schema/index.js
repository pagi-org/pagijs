var schema = require("./schema.js");
var xml = require("./xml.js");

module.exports.createBuilder = schema.createBuilder;
module.exports.createParser = schema.createParser;
module.exports.parse = xml.parse;
module.exports.parseXml = xml.parse;
