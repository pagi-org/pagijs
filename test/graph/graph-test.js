var assert = require('assert');
var print = require('util').print;
var pagi = require('../../src/js/pagi');

var testSchema = require('../test-schema/test-schema');

describe("roundtrip schema parse", function () {
    testSchema.fullList.forEach(function(schema) {
        describe("test schema " + schema.simpleName, function() {
            it('should exist', function() {
                assert.equal('test', 'test');
            });
        });
    });
});
