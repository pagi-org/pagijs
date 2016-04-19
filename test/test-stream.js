var fs = require('fs');

var streamTestRoot = __dirname + '/test-suite/stream/';

function TestStream(name) {
  var xmlTestRoot = streamTestRoot + 'xml/';
  var xmlPrefixedTestRoot = streamTestRoot + 'xml-prefixed/';
  var xmlFeaturesTestRoot = streamTestRoot + 'xml-with-features/';
  var txtTestRoot = streamTestRoot + 'txt/';
  var pbfTestRoot = streamTestRoot + 'pbf/';
  var pbfFeaturesTestRoot = streamTestRoot + 'pbf-with-features/';
  var eventsTestRoot = streamTestRoot + 'events/';

  this.name = name;

  /**
   * Returns a ReadableStream containing the stream xml.
   */
  this.getXmlStream = function() {
    return fs.createReadStream(xmlTestRoot + this.name + ".xml");
  };

  /**
   * Returns a ReadableStream containing the stream pbf.
   */
  this.getPbfStream = function() {
    return fs.createReadStream(pbfTestRoot + this.name + ".pbf");
  };

  /**
   * Returns a ReadableStream containing the stream xml, with a namespace prefix.
   */
  this.getXmlPrefixedStream = function() {
    return fs.createReadStream(xmlPrefixedTestRoot + this.name + ".xml");
  };

  /**
   * Returns a ReadableStream containing the stream xml, with a namespace prefix.
   */
  this.getXmlWithFeaturesStream = function() {
    return fs.createReadStream(xmlFeaturesTestRoot + this.name + ".xml");
  };

  /**
   * Returns a ReadableStream containing the stream pbf.
   */
  this.getPbfWithFeaturesStream = function() {
    return fs.createReadStream(pbfFeaturesTestRoot + this.name + ".pbf");
  };

  this.getXml = function() {
      return fs.readFileSync(xmlTestRoot + this.name + ".xml", { encoding: 'utf8' });
  };

  /**
   * Returns a string containing the text of the file.
   */
  this.getText = function() {
    return fs.readFileSync(txtTestRoot + this.name + ".txt", {encoding: 'utf8'});
  };
}

function getStreamsFromListFile(listFile)
{
	var lines = fs.readFileSync(streamTestRoot + listFile, {encoding: 'utf8'}).split('\n');

	return lines.map(function (line)
	                        {
		                        if (line.length < 1)
		                        {
			                        return undefined;
		                        }
		                        else
		                        {
			                        return new TestStream(line);
		                        }
	                        })
		.filter(function (stream)
	                        {
		                        return stream !== undefined;
	                        });
}
module.exports.fullList = getStreamsFromListFile("full.list");
module.exports.shortList = getStreamsFromListFile("short.list");

