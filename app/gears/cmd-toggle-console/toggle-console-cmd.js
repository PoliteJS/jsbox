/**
 * ToggleConsoleCmd
 */

var $ = require('jquery');

var globals = require('./globals');

function ToggleConsoleCmd(options, channel) {
	var self = this;

	this.options = $.extend(true, {}, globals.defaults, options || {});
	this.channel = channel;

	this.el = document.createElement('button');

	var $el = $(this.el);
	$el.addClass('jsbox-cmd jsbox-cmd-toggle-console');
	$el.html(this.options.label);

	$el.on(this.options.event, function ToggleConsoleCmd__eventHandler() {
		self.channel.emit('cmd:toggleConsole');
	});
	
}

module.exports = ToggleConsoleCmd;
