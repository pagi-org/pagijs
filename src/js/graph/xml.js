var graph = require("./graph");
var sax = require("sax");
var print = require("util").print;

function doParse(readableStream, locator) {
	var graphBuilder = graph.createBuilder();
	var streamParser = sax.createStream(true, { xmlns: true, position: true });
	streamParser.on("opentag", function (tag) {
        console.log(tag.name);
	});
	streamParser.on("closetag", function(tagName) {
        console.log(tagName);
	});
	streamParser.on("error", function(err) {
		readableStream.pause();
		readableStream.unpipe(streamParser);
        throw Error(err);
	});
	try {
        readableStream.pipe(streamParser);
	} catch (e) {
		throw Error("Could not parse stream " + readableStream.id + "..." + e);
	}
}

module.exports.createParser = function(locator) {
	return function(stream) {
		return doParse(stream, locator);
	};
};
