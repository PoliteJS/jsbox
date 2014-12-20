
var makeOptions = require('./utils/make-options');
var makeData = require('./utils/make-data');

var render = require('./private/render');

function BasicSandbox(options) {
	options = makeOptions(options);
    var data = makeData(options);
    
    this.el = document.createElement('div');
	render.call(this);

	this.options = options;
}

BasicSandbox.prototype = {
	reset: require('./public/reset'),
	run: require('./public/run')
};

module.exports = BasicSandbox;
