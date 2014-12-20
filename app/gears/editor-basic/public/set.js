
var $ = require('jquery');

function BasicEditor__set(content) {
	$(this.el).find('textarea').val(content);
}

module.exports = BasicEditor__set;
