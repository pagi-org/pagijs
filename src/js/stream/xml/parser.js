var sax = require("sax");
var events = require("events");
var sys = require("sys");
var stream = require("stream");

function XmlPagiParser() {
	if (!(this instanceof XmlPagiParser)) return new XmlPagiParser();

	var parser = this;
	sax.SAXStream.call(this, true, {xmlns: true, position: true});



}

sys.inherits(XmlPagiParser, sax.SAXStream);
