'use strict';

var assert = require('assert');
var GraphParser = require('../../src/js/graph/parsers/graphParser');
var validator = require('../../src/js/validator');

var testStream = require('../test-stream');
var maryStream = testStream.fullList.filter(function(stream) {
    return stream.name === 'mary';
})[0];

var testSchema = require('../test-schema');
var marySchema = testSchema.fullList.filter(function(schema) {
  return schema.simpleName === 'extTokFullSchema';
})[0];

describe('validator validateGraph', function() {
  var graph, schema;
  beforeEach(function(done) {
    GraphParser.parse(maryStream.getXmlStream()).then(function(aGraph) {
      graph = aGraph;

      marySchema.getParsed().then(function(aSchema) {
        schema = aSchema;
        done();
      });
    });
  });

  it('should validate a graph against a schema', function() {
    var results = validator.validateGraph(graph, schema);
    assert.equal(results.isValid, true);
    assert.equal(results.errors.length, 0);
  });
});
