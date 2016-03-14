var GraphParser = require('./graph/parsers/graphParser');

module.exports.parse = function(data) {
    return GraphParser.parse(data);
};

module.exports.schema = require('./schema');
