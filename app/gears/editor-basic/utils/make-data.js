/**
 * BasicEditor // private // makeData()
 */

var $ = require('jquery');

var globals = require('../globals');

function BasicEditor__makeData(language, options) {
	
	var data = {
		language: language
	};

	if (options.content) {
		data.content = options.content;
	}

    return $.extend(true, {}, globals.data, data);
}

module.exports = BasicEditor__makeData;
