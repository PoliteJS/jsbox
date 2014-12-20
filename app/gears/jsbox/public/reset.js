/**
 * JSBox.reset()
 */

function JSBox__reset() {
	var panels = this.data.panels;
	Object.keys(panels).forEach(function(name) {
		panels[name] && panels[name].reset();
	});
}

module.exports = JSBox__reset;
