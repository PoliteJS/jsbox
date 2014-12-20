
var renderIframe = require('../utils/render-iframe');

function BasicSandbox__run(data) {
	
	var scope = this.iframe.contentWindow;

	renderIframe(this.options.template, scope, data);

}

module.exports = BasicSandbox__run;
