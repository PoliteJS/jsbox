
var createIframe = require('../private/create-iframe');
var removeIframe = require('../private/remove-iframe');

function BasicSandbox__reset() {
	removeIframe.call(this);
	createIframe.call(this);
}

module.exports = BasicSandbox__reset;
