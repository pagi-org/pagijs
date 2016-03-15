var Graph = require('../src/js/graph/graph');
var Pagi = require('../src/js/pagi');
var assert = require('assert');
var testStream = require('./test-stream');
var stream = testStream.fullList[0];

describe("Pagi object", function () {
    it("should not have a constructor", function () {
        assert(typeof Pagi !== 'function');
    });
    describe('`parse` function', function() {
        var promise = Pagi.parse(stream.getXmlStream());
        it('exists', function() {
            assert(typeof Pagi.parse === 'function');
        });
        it('should return a promise', function() {
            assert(typeof promise.then === 'function');
        });
        it('promise should return a Graph object', function(done) {
            promise.then(function(graph) {
                assert(graph instanceof Graph);
                done();
            });
        });
    });
    describe('`serialize` function', function() {
        it('exists', function() {
            assert(typeof Pagi.serialize === 'function');
        });
        it('returns a string', function(done) {
            Pagi.parse(stream.getXmlStream()).then(function(graph) {
                assert(typeof Pagi.serialize(graph) === 'string'); 
                done();
            });
        });
    });
    describe('`schema` object', function() {
        it('exists', function() {
            assert(typeof Pagi.schema === 'object');
        });
    });
});

