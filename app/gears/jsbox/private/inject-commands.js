/**
 * JSBox // private // injectPanels()
 *
 * It replace an existing DOM element [data-role=panel-xxx] with
 * the corresponding panel instance element.
 *
 * The placeholder is then removed, a good placeholder is:
 *
 *     <link data-role="panel-html">
 *
 */

var $ = require('jquery');

function JSBox__injectCommands() {
	
	var $target = $(this.el);
	var commands = this.data.commands;

	Object.keys(commands).forEach(injectCommand);

	function injectCommand(name) {
		var cmd = commands[name];
		
		if (!cmd) {
			return;
		}

		$target
		.find('[data-role=cmd-' + name + ']')
		.after(cmd.el)
		.remove();
	}

}

module.exports = JSBox__injectCommands;
