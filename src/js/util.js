function StringBuilder() {
	var strings = [];

	var verify = function (string) {
		if (!defined(string)) {
			return "";
		}
		if (getType(string) != getType("")) {
			return String(string);
		}
		return string;
	};

	var defined = function (el) {
		return el !== null && typeof(el) != "undefined";
	};

	var getType = function (instance) {
		if (!defined(instance.constructor)) {
			throw Error("Unexpected object type");
		}
		var type = String(instance.constructor).match(/function\s+(\w+)/);

		return defined(type) ? type[1] : "undefined";
	};

	this.append = function (string) {
		string = verify(string);
		if (string.length > 0) {
			strings.push(string);
		}
		return this;
	};

	this.toString = function() {
		return strings.join("");
	};
}

function doFreeze(o) {
	Object.preventExtensions(o);
	Object.freeze(o);
}

module.exports.StringBuilder = StringBuilder;
module.exports.doFreeze = doFreeze;
