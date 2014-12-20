/**
 * ResetCmd
 */

var $ = require('jquery');

var globals = require('./globals');

function ResetCmd(options, channel) {
	var self = this;

	this.options = $.extend(true, {}, globals.defaults, options || {});
	this.channel = channel;

	this.el = document.createElement('button');

	var $el = $(this.el);
	$el.addClass('jsbox-cmd jsbox-cmd-reset');
	$el.html(this.options.label);

	$el.on(this.options.event, function ResetCmd__eventHandler() {
		self.channel.emit('cmd:reset');
	});
	
}

module.exports = ResetCmd;
