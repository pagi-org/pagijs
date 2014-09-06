pagi = require('../src/js/pagi');
assert = require('assert');

describe("initial behavior", function () {
  it("should return a string", function () {
    var str = pagi();
    assert.equal(str, "I AM PAGI");
  });
});

