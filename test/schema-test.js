var assert = require('assert');
var print = require('util').print;
var pagi = {
	schema: require('../src/js/schema')
};

var testSchema = require('./test-schema');

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



