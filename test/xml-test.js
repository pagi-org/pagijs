var assert = require('assert');
var print = require('util').print;
var pagi = {
	schema: require('../src/js/stream/xml')
};

var testStreams = require('./test-stream');

describe("xml parse", function() {
	for (var i = 0; i < testStreams.fullList.length; i++) {
		(function (testStream) {
			describe("test stream " + testStream.name, function() {
				var parser = pagi.createParser();
				parser.on("docstart", function() {

				});
				parser.on("")
				testStream.getXmlStream().pipe(parser);
			});
		})(testStreams.fullList[i]);
	}
});
describe("roundtrip schema parse", function () {
	for (var i = 0; i < testSchema.fullList.length; i++) {
		(function (schema) {
			describe("test schema " + schema.simpleName, function() {
				it("should have an id", function () {
					var str = schema.simpleName;
					assert.equal(str, schema.simpleName);
				});
				it("should match the flat representation", function(done) {
					schema.getParsed().then(function(schemaObject) {
						var flatRep = testSchema.toFlatString(schemaObject);
						//var s = "----------------------------------------------------------\n";
						//print ("\n", s, "    ", schema.simpleName, "\n", s,
						//	   flatRep, "\n", s, s);
						assert.equal(schema.getFlatRepresentation(), flatRep);
					}).done(done, done);
				});
			});
		})(testSchema.fullList[i]);
	}
});


