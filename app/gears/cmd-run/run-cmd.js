/**
 * RunCmd
 */

var $ = require('jquery');

var globals = require('./globals');

function RunCmd(options, channel) {
	var self = this;

	this.options = $.extend(true, {}, globals.defaults, options || {});
	this.channel = channel;

	this.el = document.createElement('button');

	var $el = $(this.el);
	$el.addClass('jsbox-cmd jsbox-cmd-run');
	$el.html(this.options.label);

	$el.on(this.options.event, function CmdRun__eventHandler() {
		self.channel.emit('cmd:run');
	});
	
	this.dispose = function() {
		$el.off();
		$el.remove();
	};
	
}

module.exports = RunCmd;
