var assert = require('assert');
var testStream = require('../test-stream');
var GraphParser = require('../../src/js/graph/parsers/graphParser');
var Graph = require('../../src/js/graph/graph');

describe('GraphParser', function() {
    var stream = testStream.shortList[0];
    it('Does not provide a constructor function', function() {
        assert(typeof GraphParser !== 'function');
    });
    it('provides a default `parse` function', function() {
        assert(typeof GraphParser.parse === 'function');
    });
    it('provides a specific `parseXml` function', function() {
        assert(typeof GraphParser.parseXml === 'function');
    });
    it('provides a default parser that equals the Xml parser', function() {
        assert(GraphParser.parse === GraphParser.parseXml);
    });
    it('returns a promise given a stream', function() {
        assert(typeof GraphParser.parse(stream.getXmlStream()).then === 'function');
    });
    it('the promise returns a graph instance', function(done) {
        GraphParser.parse(stream.getXmlStream()).then(function(graph) {
            assert(graph instanceof Graph);
            done();
        }, done).catch(done);
    });
});
