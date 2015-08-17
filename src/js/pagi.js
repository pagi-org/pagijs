var sax = require('sax');

module.exports = function() {
  return "I AM PAGI";
};

module.exports.schema = require('./schema');
module.exports.xml = require('./stream/xml');
module.exports.pbf = require('./stream/pbf');

