
var makeOptions = require('./utils/make-options');
var makeData = require('./utils/make-data');

var render = require('./private/render');

function BasicSandbox(options, channel) {
	this.options = makeOptions(options);
    this.data = makeData(options);
    this.channel = channel;
    
    this.el = document.createElement('div');
	render.call(this);

}

BasicSandbox.prototype = {
	reset: require('./public/reset'),
	run: require('./public/run'),
	dispose: require('./public/dispose')
};

module.exports = BasicSandbox;
