/**
 * BasicEditor // private // makeOptions()
 */

var $ = require('jquery');

var globals = require('../globals');

function BasicEditor__makeOptions(options) {
	options = options || {};
    options = $.extend(true, {}, globals.defaults, options);
    return options;
}

module.exports = BasicEditor__makeOptions;
