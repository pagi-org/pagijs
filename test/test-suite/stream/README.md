This is the official pagi stream test suite. It includes several source 
documents, as well as multiple representations of a pagi stream for each one.

For each source document, the suite contains:

 - pbf streams
 - pbf streams with features
 - xml streams
 - xml streams with features
 - xml streams using a namespace prefix
 - a simple newline and tab delimited event listing

The recommended usage pattern is to create a stream based on the event listing,
and ensure that it matches the streams created by parsing the other 
representations.

The event listing parsing can be tested by creating an outputter for that 
format and then comparing it to the original source file.

-----

The Event Listing format:

This is a simple event format. It is plain text. Each line represents a single
event and is terminated by a single line feed. 

A line will consist of the event name and the relevant values for that event,
represented textually. These are tab separated.

One exception to this rule is the CONTENT event. The CONTENT event's value is
the content, but duplication in this setting only breeds confusion. Instead
of representing the exact content in this event line, a reference is used:

    <crc32>::<txtFileName>

Any stream reader should then load the actual text from the referenced text file 
and validate the crc32 value.

