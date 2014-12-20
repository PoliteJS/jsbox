
var $ = require('jquery');

function BasicSandbox__createIframe() {
	this.iframe = document.createElement('iframe', null, 'jsbox-basic-sandbox-iframe');
	$(this.el).append(this.iframe);
}

module.exports = BasicSandbox__createIframe;
