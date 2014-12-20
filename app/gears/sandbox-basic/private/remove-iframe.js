
var $ = require('jquery');

function BasicSandbox__createIframe() {
	if (!this.iframe) {
		return;
	}
	$(this.iframe).remove();
	this.iframe = null;
}

module.exports = BasicSandbox__createIframe;
