var assert = require('assert');
var testStreams = require('../test-stream');
var Pagi = require('../../src/js/pagi');
var Node = require('../../src/js/graph/node');
var maryStream = testStreams.fullList.filter(function(stream) {
    return stream.name === 'mary';
})[0];

describe('Graph manipulation for `mary` stream', function() {
    var graph;
    beforeEach(function(done) {
        Pagi.parse(maryStream.getXmlStream()).then(function(aGraph) {
            graph = aGraph;
            done();
        });
    });

    describe('graph functions for manipulation', function() {
        it('can create new nodes', function() {
            var node = graph.createNode();
            assert(node instanceof Node);
        });
    });
    describe('adding a node to the graph', function() {
        var node;
        beforeEach(function() { node = graph.createNode(); });

        it('node must contain a type', function() {
            assert.throws(function() {
                graph.addNode(node);
            }, /must have a TYPE/);
        });
        it('adding a node with the same id as another will error', function() {
            node.setId('1');
            node.setType('TOK');
            assert.throws(function() {
                graph.addNode(node);
            }, /contains a node with id `1`/);
        });
        it('node without an id will get a generated id', function() {
            node.setType('TOK');
            graph.addNode(node);
            // IDs should increment consecutively.
            assert.equal(node.getId(), (parseInt(graph._generateNodeId()) - 1).toString());
        });
        it('node will be added to the graph', function() {
            var preAddTotalCount = graph.getNodes().length;
            var preAddTypeCount = graph.getNodesByType('TOK').length;
            node.setType('TOK');
            graph.addNode(node);
            assert.equal(node, graph.getNodeById(node.getId()));
            assert.equal(preAddTotalCount, graph.getNodes().length - 1);
            assert.equal(preAddTypeCount, graph.getNodesByType(node.getType()).length - 1);
        });
        describe('sequence trait', function() {
            it('adding a first node', function() {
                node.setType('TOK');
                node.addEdge('24', 'TOK', 'next');
                graph.addNode(node);
                assert.equal(node.next(), graph.getNodeById('24'));
            });
            it('adding a middle node', function() {
                node.setType('TOK');
                node.addEdge('83', 'TOK', 'next');
                graph.addNode(node);
                assert.equal(node.previous(), graph.getNodeById('24'));
                assert.equal(node.next(), graph.getNodeById('83'));
            });
            it('adding a last node', function() {
                // Not sure this is possible.
            });
            it('has access to it\'s parents', function() {
                node.setType('TOK');
                node.addEdge('83', 'TOK', 'next');
                graph.addNode(node);
                assert.equal(node.getFirstParentOfType('SB'), graph.getNodeById('68'));
            });
        });
    });
    describe('adding an edge to a node', function() {
        var node;
        beforeEach(function() {
            node = graph.createNode();
            node.setType('TOK');
            graph.addNode(node);
        });

        it('creates the edge', function() {
            node.addEdge('2', 'TOK', 'arbitrary-edge');
            var edge = node.getFirstEdgeByType('arbitrary-edge');
            assert.equal(edge.getTargetId(), '2');
            assert.equal(edge.getTargetType(), 'TOK');
            assert.equal(edge.getEdgeType(), 'arbitrary-edge');
        });
    });
    describe('removing a node from a graph', function() {
        var node, prevNode, nextNode, nodeTotalCnt, nodeTypeCnt;
        beforeEach(function() {
            node = graph.getNodeById('2');
            prevNode = node.previous();
            nextNode = node.next();
            nodeTotalCnt = graph.getNodes().length;
            nodeTypeCnt = graph.getNodesByType(node.getType()).length;
            graph.removeNode(node);
        });

        it('node is removed properly', function() {
            assert.equal(graph.getNodes().length, nodeTotalCnt - 1);
            assert.equal(graph.getNodesByType(node.getType()).length, nodeTypeCnt - 1);
            assert.equal(graph.getNodeById(node.getId()), null);
        });
        it('node\'s edges are removed properly for sequences', function() {
            assert(nextNode.hasPrevious());
            assert(nextNode.previous() === prevNode);
            assert(prevNode.hasNext());
            assert(prevNode.next() === nextNode);
        });
    });
    describe('removing an edge from a node', function() {
        var node;
        beforeEach(function() {
            node = graph.getNodeById('2');
            var nextEdge = node.getFirstEdgeByType('next');
            node.removeEdge(nextEdge);
        });

        it('should no longer have a reference to that edge', function() {
            assert.equal(node.getFirstEdgeByType('next'), undefined);
            assert.equal(node.hasNext(), false);
        });
    });
});
