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

function JSBox__injectPanels() {
	
	var $target = $(this.el);
	var panels = this.data.panels;

	Object.keys(panels).forEach(injectPanel);

	function injectPanel(name) {
		var panel = panels[name];
		
		if (!panel) {
			return;
		}

		$target
		.find('[data-role=panel-' + name + ']')
		.after(panel.el)
		.remove();
	}

}

module.exports = JSBox__injectPanels;
