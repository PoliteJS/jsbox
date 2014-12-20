/**
 * BasicSandbox // private // makeOptions()
 */

var $ = require('jquery');

var globals = require('../globals');

function BasicSandbox__makeOptions(options) {
	options = options || {};
    options = $.extend(true, {}, globals.defaults, options);
    return options;
}

module.exports = BasicSandbox__makeOptions;
