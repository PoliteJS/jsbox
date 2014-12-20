/**
 * JSBox // private // makeOptions()
 */

var $ = require('jquery');

var globals = require('../globals');

function JSBox__makeOptions(options) {
	options = options || {};
    options = $.extend(true, {}, globals.defaults, options);
    return options;
}

module.exports = JSBox__makeOptions;
