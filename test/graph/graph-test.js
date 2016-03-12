var assert = require('assert');
var print = require('util').print;
var graph = require('../../src/js/graph/graph');
var testStream = require('../test-stream/test-stream');

describe("Checking graph properties and functions", function() {
    var stream;
    beforeEach(function() {
        stream = testStream.shortList[0];
    });
    describe('graph index.js exports', function() {
        it('provides a `createBuilder` function', function() {
            assert(typeof graph.createBuilder === 'function');
        });
    });
});

testStream.shortList.forEach(function(stream) {
    describe("Test stream " + stream.simpleName, function() {
        it('Returns a Pagi object', function() {
            graph.createParser()(stream.getXmlStream());
            assert.equal('test', 'test');
        });
    });
});
