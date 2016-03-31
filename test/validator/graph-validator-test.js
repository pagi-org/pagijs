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

describe.only('validator validateGraph', function() {
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
    assert(results.errors.length === 0);
  });

  it('should validate min arity', function() {
    var node = graph.getNodeById('0');
    delete node._properties.start;
    graph._graphImpl.setNode('0', node);

    var results = validator.validateGraph(graph, schema);

    assert.equal(results.isValid, false);
    assert(results.errors.length === 1);
    assert(results.errors[0].message === 'start is a required property');
  });

  it('should validate max arity', function() {
    var node = graph.getNodeById('0');
    node._properties.start.vals.push(50);
    graph._graphImpl.setNode('0', node);

    var results = validator.validateGraph(graph, schema);

    assert.equal(results.isValid, false);
    assert(results.errors.length === 1);
    assert(results.errors[0].message === 'Arity of start property is out of range. Arity min: 1 Arity max: 1 Arity Actual: 2');
  });

  it('should validate intProps', function() {
    var node = graph.getNodeById('0');
    node._properties.start.vals = ['I am a string'];
    graph._graphImpl.setNode('0', node);

    var results = validator.validateGraph(graph, schema);

    assert.equal(results.isValid, false);
    assert(results.errors.length === 2);
    assert.equal(results.errors[0].message, 'start must be an integer');
    assert.equal(results.errors[1].message, 'start must be within 0 and 2147483647');
  });

  it('should validate intProps', function() {
    var node = graph.getNodeById('0');
    node._properties.start.vals = ['I am a string'];
    graph._graphImpl.setNode('0', node);

    var results = validator.validateGraph(graph, schema);

    assert.equal(results.isValid, false);
    assert(results.errors.length === 2);
    assert.equal(results.errors[0].message, 'start must be an integer');
    assert.equal(results.errors[1].message, 'start must be within 0 and 2147483647');
  });
  // it('', function() {});
});
