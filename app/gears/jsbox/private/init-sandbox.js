/**
 * JSBox // private // initSandbox()
 */

var getConstructor = require('utils/get-constructor');

function JSBox__initSandbox() {

	var config = this.options.panels.sandbox;
	var Sandbox = null;

	Sandbox = getConstructor(config.type, this.options.custom.sandbox);
	
	this.data.sandboxIsEnabled = config.enabled;
	this.data.panels.sandbox = new Sandbox(config, this.channel);

}

module.exports = JSBox__initSandbox;
