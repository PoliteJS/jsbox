/**
 * JSBox // private // initCommands()
 */

var getConstructor = require('utils/get-constructor');
var globals = require('../globals');

function JSBox__initCommands() {
	var self = this;

	var availableCommands = Object.keys(globals.defaults.commands);
	availableCommands.forEach(initCommand);

	function initCommand(command) {
		
		var config = self.options.commands[command];
		var Command = null;
		var instance = null;

		if (!config.enabled) {
			return;
		}

		// build editor instance
		Command = getConstructor(config.type, self.options.custom.cmd[command]);

		self.data['cmd' + ucFirst(command) + 'IsEnabled'] = config.enabled;
		self.data.commands[command] = new Command(config, self.channel);
	}
}

function ucFirst(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = JSBox__initCommands;
