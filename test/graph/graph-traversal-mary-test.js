var assert = require('assert');
var testStreams = require('../test-stream/test-stream');
var GraphParser = require('../../src/js/graph/parsers/graphParser');
var maryStream = testStreams.fullList.filter(function(stream) {
    return stream.name === 'mary';
})[0];

describe('Graph traversal for Mary stream', function() {
    var graph;
    beforeEach(function(done) {
        GraphParser.parse(maryStream.getXmlStream()).then(function(aGraph) {
            graph = aGraph;
            done();
        });
    });
    it('should return the right amount of nodes', function() {
        assert.equal(graph.getNodes().length, 500);
    });
});
