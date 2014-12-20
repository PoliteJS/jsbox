
var $ = require('jquery');

var JSBoxGlobals = require('jsbox/globals');

function configJSBoxGlobals(options) {
	$.extend(true, JSBoxGlobals.defaults, options || {});
}

module.exports = configJSBoxGlobals;
