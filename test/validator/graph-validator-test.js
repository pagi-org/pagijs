'use strict';

var assert = require('assert');
var GraphParser = require('../../src/js/graph/parsers/graphParser');
var validator = require('../../src/js/validator');

var testStream = require('../test-stream');
var maryStream = testStream.fullList.filter(function(stream) {
    return stream.name === 'mary';
})[0];
var testDoc2Stream = testStream.fullList.filter(function(stream) {
    return stream.name === 'testDoc2';
})[0];

var testSchema = require('../test-schema');
var marySchemaSpec = testSchema.fullList.filter(function(schema) {
  return schema.simpleName === 'extTokFullSchema';
})[0];
var testDoc2SchemaSpec = testSchema.fullList.filter(function(schema) {
  return schema.simpleName === 'simplePropsSchema';
})[0];

describe('validator validateGraph', function() {
  var marryGraph, marryschema;
  beforeEach(function(done) {
    GraphParser.parse(maryStream.getXmlStream()).then(function(aGraph) {
      marryGraph = aGraph;

      marySchemaSpec.getParsed().then(function(aSchema) {
        marryschema = aSchema;
        done();
      });
    });
  });

  var testDoc2Graph, testDoc2Schema;
  beforeEach(function(done) {
    GraphParser.parse(testDoc2Stream.getXmlStream()).then(function(aGraph) {
      testDoc2Graph = aGraph;

      testDoc2SchemaSpec.getParsed().then(function(aSchema) {
        testDoc2Schema = aSchema;
        done();
      });
    });
  });

  it('should validate a graph against a schema', function() {
    var results = validator.validateGraph(marryGraph, marryschema);
    assert.equal(results.isValid, true);
    assert(results.errors.length === 0);
  });

  it('should validate min arity', function() {
    var node = marryGraph.getNodeById('0');
    delete node._properties.start;
    marryGraph._graphImpl.setNode('0', node);

    var results = validator.validateGraph(marryGraph, marryschema);

    assert.equal(results.isValid, false);
    assert(results.errors.length === 1);
    assert(results.errors[0].message === 'start is a required property');
  });

  it('should validate max arity', function() {
    var node = marryGraph.getNodeById('0');
    node._properties.start.vals.push(50);
    marryGraph._graphImpl.setNode('0', node);

    var results = validator.validateGraph(marryGraph, marryschema);

    assert.equal(results.isValid, false);
    assert(results.errors.length === 1);
    assert(results.errors[0].message === 'Arity of start property is out of range. Arity min: 1 Arity max: 1 Arity Actual: 2');
  });

  it('should validate intProps', function() {
    var node = marryGraph.getNodeById('0');
    node._properties.start.vals = ['I am a string'];
    marryGraph._graphImpl.setNode('0', node);

    var results = validator.validateGraph(marryGraph, marryschema);

    assert.equal(results.isValid, false);
    assert(results.errors.length === 2);
    assert.equal(results.errors[0].message, 'start must be an integer');
    assert.equal(results.errors[1].message, 'start must be within 0 and 2147483647');
  });

  it('should validate intProps (string)', function() {
    var node = marryGraph.getNodeById('0');
    node._properties.start.vals = ['I am a string'];
    marryGraph._graphImpl.setNode('0', node);

    var results = validator.validateGraph(marryGraph, marryschema);

    assert.equal(results.isValid, false);
    assert(results.errors.length === 2);
    assert.equal(results.errors[0].message, 'start must be an integer');
    assert.equal(results.errors[1].message, 'start must be within 0 and 2147483647');
  });

  it('should validate intProps (float)', function() {
    var node = marryGraph.getNodeById('0');
    node._properties.start.vals = [0.55];
    marryGraph._graphImpl.setNode('0', node);

    var results = validator.validateGraph(marryGraph, marryschema);

    assert.equal(results.isValid, false);
    assert(results.errors.length === 1);
    assert.equal(results.errors[0].message, 'start must be an integer');
  });

  it('should validate strProps', function() {
    var node = marryGraph.getNodeById('0');
    node._properties.pos.vals = [5];
    marryGraph._graphImpl.setNode('0', node);

    var results = validator.validateGraph(marryGraph, marryschema);

    assert.equal(results.isValid, false);
    assert(results.errors.length === 2);
    assert.equal(results.errors[0].message, 'pos must be a string');
    assert.equal(results.errors[1].message, '5 is not a valid value for property pos');
  });

  it('should validate floatProps', function() {
    var node = testDoc2Graph.getNodeById('7');
    node._properties.precision.vals = ['I am STRING'];
    testDoc2Graph._graphImpl.setNode('7', node);

    var results = validator.validateGraph(testDoc2Graph, testDoc2Schema);

    assert.equal(results.isValid, false);
    assert(results.errors.length === 2);
    assert.equal(results.errors[0].message, 'precision must be a float');
    assert.equal(results.errors[1].message, 'precision must be within 0 and 1');
  });

  it('should validate boolProps', function() {
    var node = testDoc2Graph.getNodeById('13');
    node._properties.enabled.vals = [0];
    testDoc2Graph._graphImpl.setNode('13', node);

    var results = validator.validateGraph(testDoc2Graph, testDoc2Schema);

    assert.equal(results.isValid, false);
    assert(results.errors.length === 1);
    assert.equal(results.errors[0].message, 'enabled must be a boolean');
  });

  it('should validate required edges exist', function() {
    var node = marryGraph.getNodeById('7');
    node.removeEdges();
    marryGraph._graphImpl.setNode('7', node);

    var results = validator.validateGraph(marryGraph, marryschema);

    assert.equal(results.isValid, false);
    assert(results.errors.length === 1);
    assert.equal(results.errors[0].message, 'member is a required edge');
  });

  it('should validate target Edge existence', function() {
    marryGraph._graphImpl.removeNode('8');

    var results = validator.validateGraph(marryGraph, marryschema);

    assert.equal(results.isValid, false);
    assert(results.errors.length === 3);
    assert.equal(results.errors[0].message, 'member edge points to non-existent node with id 8');
  });

  it('should validate target Edge type', function() {
    var node = marryGraph.getNodeById('7');
    node.addEdge('10', 'TOK', 'member');
    marryGraph._graphImpl.setNode('7', node);

    var results = validator.validateGraph(marryGraph, marryschema);

    assert.equal(results.isValid, false);
    assert(results.errors.length === 1);
    assert.equal(results.errors[0].message, 'COREF is an invalid target for edge member');
  });
});
