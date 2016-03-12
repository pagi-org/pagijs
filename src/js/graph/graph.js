var xml = require("./xml.js");

function PagiGraph() {

}

function GraphBuilder(param) {
    this.nodeMap = { };

}
GraphBuilder.prototype.build = function() {

    return new PagiGraph();
};

module.exports.createBuilder = function() {
	return new GraphBuilder(false);
};
module.exports.createParser = xml.createParser;
