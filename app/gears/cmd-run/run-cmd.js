
var $ = require('jquery');

var globals = require('./globals');

function RunCmd(options) {

	this.options = $.extend(true, {}, globals.defaults, options || {});

	console.log("HUHUHI", this.options);

	this.el = document.createElement('button');
	this.el.innerHTML = options.label;
}

module.exports = RunCmd;
