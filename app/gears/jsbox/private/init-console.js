/**
 * JSBox // private // initConsole()
 */

var getConstructor = require('utils/get-constructor');

function JSBox__initConsole() {

	var config = this.options.panels.console;
	var Console = null;

	Console = getConstructor(config.type, this.options.custom.console);

	this.data.consoleIsEnabled = config.enabled;
	this.data.panels.console = new Console(config, this.channel);

}

module.exports = JSBox__initConsole;
