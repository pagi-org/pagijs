var assert = require('assert');
var print = require('util').print;
var idGenerator = require('../src/js/schema/idGenerator.js');

var prop = idGenerator.prop;
var sequential = idGenerator.sequential;
var random = idGenerator.random;
var staticValue = idGenerator.staticValue;
var edge = idGenerator.edge;

function pattern(pattern) {
	var components = [];
	// start with arg 1 since we aren't counting 'pattern'
	// we don't use 'slice' here due to the optimization warning here: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments
	for (var i = 1; i < arguments.length; i++) {
		components[i-1] = arguments[i];
	}
	return {pattern: pattern, generator: idGenerator.generator(components)};
}

var testCases = [
	pattern("{seq}", sequential()),
	pattern("{random}", random()),
	pattern("{prop:p1}", prop("p1")),
	pattern("myNode", staticValue("myNode")),
	pattern("myNode-{seq}-stuff", staticValue("myNode-"), sequential(), staticValue("-stuff")),
	pattern("myNode-{random}-stuff", staticValue("myNode-"), random(), staticValue("-stuff")),
	pattern("myNode-{prop:p1}-stuff", staticValue("myNode-"), prop("p1"), staticValue("-stuff")),
	pattern("my-{seq}-{random}-{prop:p1}-{prop:p2}-stuff", staticValue("my-"), sequential(), staticValue("-"), random(), staticValue("-"), prop("p1"), staticValue("-"), prop("p2"), staticValue("-stuff")),
	pattern("{random:4}", random(4)),
	pattern("{random:4/36}", random(4, 36)),
	pattern("{random:6}", random(6)),
	pattern("{prop:,:p1}", prop("p1", ",")),
	// empty string is no longer a valid delimiter
	pattern("{prop:|:p1}", prop("p1", "|")),
	pattern("{prop: __ :p1}", prop("p1", " __ ")),
	pattern("{edge:e1}", edge("e1")),
	pattern("{edge:*:e1}", edge("e1", "*")),
	pattern("myNode-{edge:e1}-stuff", staticValue("myNode-"), edge("e1"), staticValue("-stuff"))
];

describe("parse id generator patterns", function() {
	for (var i = 0; i < testCases.length; i++) {
		(function (testCase) {
			it("generator pattern " + testCase.pattern + " should parse to the expected generator object", function ()
			{
				var parsed = idGenerator.parse(testCase.pattern);
				assert.deepEqual(parsed, testCase.generator);
			})
		})(testCases[i]);
	}
});
