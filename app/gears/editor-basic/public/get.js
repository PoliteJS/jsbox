
var $ = require('jquery');

function BasicEditor__get() {
	return $(this.el).find('textarea').val();
}

module.exports = BasicEditor__get;
