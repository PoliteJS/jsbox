/**
 * BasicSandbox // private // makeData()
 */

var $ = require('jquery');

var globals = require('../globals');

function BasicSandbox__makeData(options) {
	
	var data = {};

    return $.extend(true, {}, globals.data, data);
}

module.exports = BasicSandbox__makeData;
