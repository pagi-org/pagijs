var fs = require('fs');
var assert = require('assert');
var print = require('util').print;
var pagi = {
	schema: require('../src/js/schema')
};

var testSchema = require('./test-schema');

describe("roundtrip schema parse", function () {
    testSchema.fullList.forEach(function(schema) {
        // console.log('Schema: ' + schema.simpleName);
        // if (schema.simpleName !== 'extTokFullSchema') { return; }
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
                    // fs.writeFileSync('/tmp/schema-' + schema.simpleName + '-flat-gold.txt', schema.getFlatRepresentation());
                    // fs.writeFileSync('/tmp/schema-' + schema.simpleName + '-flat.txt', flatRep);
                    assert.equal(schema.getFlatRepresentation(), flatRep);
                }).done(done, done);
            });
        });
    });
});



