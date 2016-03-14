var assert = require('assert');
var GraphParserXml = require('../../src/js/graph/parsers/graphParserXml');

describe('GraphParserXml', function() {
    it('provides a constructor function', function() {
        assert(typeof GraphParserXml === 'function');
    });
    it('provides a `parse` function', function() {
        var parser = new GraphParserXml();
        assert(typeof parser.parse === 'function');
    });
});
