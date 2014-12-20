
var Mustache = require('mustache');

function BasicSandbox__renderIframe(template, iframe, data) {
	iframe.document.open();
	iframe.document.write(Mustache.render(template, data));
	iframe.document.close();
}

module.exports = BasicSandbox__renderIframe;
