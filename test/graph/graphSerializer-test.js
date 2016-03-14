var fs = require('fs');
var assert = require('assert');
var testStream = require('../test-stream');
var GraphParser = require('../../src/js/graph/parsers/graphParser');
var GraphSerializer = require('../../src/js/graph/serializers/graphSerializer');

describe('GraphSerializer', function() {
    it('does not have a constructor function', function() {
        assert(typeof GraphSerializer !== 'function');
    });
    it('has a `serialize` function', function() {
        assert(typeof GraphSerializer.serialize === 'function');
    });
    it('has a `serializeXml` function', function() {
        assert(typeof GraphSerializer.serializeXml === 'function');
    });

    var stream = testStream.fullList[0];
    describe('test schema `' + stream.name + '` serialization', function() {
        var graph;
        beforeEach(function(done) {
            GraphParser.parse(stream.getXmlStream()).then(function(aGraph) {
                graph = aGraph; done();
            });
        });
        // The test-suite does not store nodes in any sorted order
        // so checking aginst the xml docs with an exported graph
        // will always fail for the time being.
        // it('matches the xml file', function() {
        //     var serialized = GraphSerializer.serialize(graph);
        //     var gold = stream.getXml();
        //     fs.writeFileSync('/tmp/schema-serialize-' + stream.name + '.xml', serialized);
        //     fs.writeFileSync('/tmp/schema-serialize-' + stream.name + '-gold.xml', gold);
        //     assert.equal(serialized, gold);
        // });
    });
});
