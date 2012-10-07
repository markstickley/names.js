names.js
========

Bringing flexibility and clarity to JavaScript function calls.


About
-----

name.js adds the following features to the JavaScript Function prototype:

* Named, unordered arguments
* Default argument values


Usage
-----

For full documentation, please see the [documentation pages](http://markstickley.github.com/name.js).


Building
--------

You can minify the project into `names.min.js` by taking the following steps:

* Ensure `build` is executable. If it's not, run `chmod u+x build` on the command line
* Build with the command `./build`

The build script assumes that requirejs and node.js are installed globally.

To install node.js, visit the [node.js download page](http://nodejs.org/). To install requirejs globally, first install node.js, then run `npm install -g requirejs`.


Tests
-----

A full test suit can be run by visiting `tests/index.html`. Tests are written using Jasmine.


Dependencies
------------

* names.js can be used with [requirejs](http://www.requirejs.org) but does NOT depend on it.
* Tests depend on [Jasmine](http://pivotal.github.com/jasmine/)