var fs = require('fs');
var assert = require('assert');
var libxslt = require('libxslt');
var testStream = require('../test-stream');
var GraphParser = require('../../src/js/graph/parsers/graphParser');
var GraphSerializer = require('../../src/js/graph/serializers/graphSerializer');
var pagiXsltStr = fs.readFileSync(__dirname + '/../resources/pagif-normalizer.xslt');
var PAGI_XSLT = libxslt.parse(pagiXsltStr.toString());

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

    testStream.fullList.forEach(function(stream) {
        // if (stream.name !== 'extTokFullSchema') { return; }
        // console.log("GraphSerializer testing stream " + stream.name);

        describe('test schema `' + stream.name + '` serialization', function() {
            if (stream.name === 'testDoc1') {
                it('does not support node features', function() {
                    GraphParser.parse(stream.getXmlStream()).fail(function(err) {
                        assert.throws(err, /Pagi.js does not support node features/);
                    });
                });
            } else if (stream.name === 'testDoc2') {
                it('does not support nested node properties', function() {
                    GraphParser.parse(stream.getXmlStream()).fail(function(err) {
                        assert.throws(err, /Pagi.js does not support nested node property values/);
                    });
                });
            } else {
                var graph;
                beforeEach(function(done) {
                    GraphParser.parse(stream.getXmlStream()).then(function(aGraph) {
                        graph = aGraph; done();
                    });
                });
                it('matches the xml file', function() {
                    var preSerialized = GraphSerializer.serialize(graph);
                    // fs.writeFileSync('/tmp/pre-serialize-' + stream.name + '.xml', preSerialized);
                    var serialized = PAGI_XSLT.apply(preSerialized);
                    var gold = PAGI_XSLT.apply(stream.getXml());
                    // fs.writeFileSync('/tmp/serialize-' + stream.name + '.xml', serialized);
                    // fs.writeFileSync('/tmp/serialize-' + stream.name + '-gold.xml', gold);
                    assert.equal(serialized, gold);
                });
            }
        });
    });
});
