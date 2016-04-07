var util = require("../util.js");

module.exports.TRAIT_SPAN_START_PROP = "start";
module.exports.TRAIT_SPAN_LENGTH_PROP = "length";
module.exports.TRAIT_SEQUENCE_NEXT_EDGE = "next";
module.exports.TRAIT_SPAN_CONTAINER_FIRST_EDGE = "first";
module.exports.TRAIT_SPAN_CONTAINER_LAST_EDGE = "last";
module.exports.INTEGER_DEFAULT_MIN_RANGE = -0x80000000;
module.exports.INTEGER_DEFAULT_MAX_RANGE = 0x7fffffff;
module.exports.FLOAT_DEFAULT_MIN_RANGE = -3.4028235e+38;
module.exports.FLOAT_DEFAULT_MAX_RANGE = 3.4028235e+38;
module.exports.ID_RANDOM_DEFAULT_LENGTH = 8;
module.exports.ID_RANDOM_DEFAULT_BASE = 10;
module.exports.ID_PROP_DEFAULT_DELIMITER = ",";
module.exports.ID_EDGE_DEFAULT_DELIMITER = ",";
module.exports.DEFAULT_MIN_ARITY = 0;
module.exports.UNBOUNDED_ARITY = -1;
module.exports.DEFAULT_MAX_ARITY = module.exports.UNBOUNDED_ARITY;
module.exports.DEFAULT_TRAIT_SEQUENCE_CONTIGUOUS = false;

var ValueType = {
	INTEGER: {"name": "INTEGER"},
	FLOAT: {"name": "FLOAT"},
	BOOLEAN: {"name": "BOOLEAN"},
	STRING: {"name": "STRING"}
};

util.doFreeze(ValueType);

module.exports.ValueType = ValueType;
