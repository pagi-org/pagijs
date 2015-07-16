var testSchema = require('./test-schema');
var assert = require('assert');

describe("test test-schema utility", function () {
  for (var i = 0; i < testSchema.fullList.length; i++) {
    var def = function(schema) {
      describe("test schema " + schema.simpleName, function() {
        it("should have an id", function () {
          var str = schema.simpleName;
          assert.equal(str, schema.simpleName);
        });
        it("should have a non-empty flat representation", function() {
          var flat = schema.getFlatRepresentation();
          assert(flat.length > 0, "no text in flat representation");
        });
        it("should have a non-empty xml stream", function() {
          var xml = schema.getXmlStream();
          var size = 0;
          xml.on('data', function(chunk) {
            size += chunk.length;
          });
          xml.on('end', function() {
            assert(size > 0, "no content in xml representation");
          });
        });
        it("should return a promise with a schema on getParsed", function(done) {
          schema.getParsed().then(function(schema) {
            assert(schema);
            done();
          }, done).catch(done);
        });
      });
    };
    def(testSchema.fullList[i]);
  }
});

