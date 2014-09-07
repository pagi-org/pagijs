var testSchema = require('./test-schema');
var assert = require('assert');

describe("test test-schema utility", function () {
  for (var i = 0; i < testSchema.fullList.length; i++) {
    var schema = testSchema.fullList[i];
    describe("test schema " + schema.simpleName, function() {
      it("should have an id", function () {
        var str = schema.simpleId;
        assert.equal(str, schema.simpleId);
      });
    });
  }
});

