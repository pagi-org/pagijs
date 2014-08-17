pagi = require('../src/js/pagi');

describe("initial behavior", function () {
  it("should return a string", function () {
    var str = pagi();
    expect(str).toBe("I AM PAGI");
  });
});

