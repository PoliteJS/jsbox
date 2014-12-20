/**
 * JSBox // private // makeData()
 */

var $ = require('jquery');

var globals = require('../globals');

function JSBox__makeData(data) {
	data = data || {};
    data = $.extend(true, {}, globals.data, data);
    return data;
}

module.exports = JSBox__makeData;
