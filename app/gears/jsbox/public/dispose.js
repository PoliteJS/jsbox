/**
 * JSBox.dispose()
 */

var $ = require('jquery');

function JSBox__dispose(target) {
	
	var panels = this.data.panels;
	Object.keys(panels).forEach(function(name) {
		panels[name] && panels[name].dispose();
	});

	var commands = this.data.commands;
	Object.keys(commands).forEach(function(name) {
		commands[name] && commands[name].dispose();
	});

	this.channel.dispose();

    $(this.el).remove();
}

module.exports = JSBox__dispose;
