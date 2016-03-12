var testStream = require('./test-stream');
var assert = require('assert');

describe("test test-stream utility", function() {
    testStream.fullList.forEach(function(stream) {
        describe("test stream" + stream.simpleName, function() {
            it("should have an id", function () {
                var str = stream.name;
                assert.equal(str, stream.name);
            });
            it("should have a non-empty xml stream", function() {
                var xml = stream.getXmlStream();
                var size = 0;
                xml.on('data', function(chunk) {
                    size += chunk.length;
                });
                xml.on('end', function() {
                    assert(size > 0, "no content in xml representation");
                });
            });
        });
    });
});

