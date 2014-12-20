/**
 * FullScreenCmd
 */

var $ = require('jquery');

var globals = require('./globals');

function FullScreenCmd(options, channel) {
	var self = this;

	this.options = $.extend(true, {}, globals.defaults, options || {});
	this.channel = channel;

	this.el = document.createElement('button');

	var $el = $(this.el);
	$el.addClass('jsbox-cmd jsbox-cmd-full-screen');
	$el.html(this.options.label);

	$el.on(this.options.event, function FullScreenCmd__eventHandler() {
		self.channel.emit('cmd:fullScreen');
	});

	this.dispose = function() {
		$el.off();
		$el.remove();
	};
	
}

module.exports = FullScreenCmd;
