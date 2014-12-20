
var $ = require('jquery');

var jsboxGlobals = require('../globals');
var makeOptions = require('../utils/make-options');

describe('JSBox Utils -- makeOptions', function() {

	var originalGlobals;

	beforeEach(function() {
		originalGlobals = $.extend(true, {}, jsboxGlobals.defaults);
	});

	afterEach(function() {
		jsboxGlobals.defaults = originalGlobals;
	});

	it('should add properties', function() {
		var options = makeOptions({__newProp__ : 123});
		expect(options).to.have.property('__newProp__');
	});

	it('should override properties', function() {
		jsboxGlobals.defaults.foo = 'a';
		var options = makeOptions({foo : 'b'});
		expect(options.foo).to.equal('b');
	});

});
