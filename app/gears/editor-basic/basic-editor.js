
var get = require('./public/get');
var set = require('./public/set');
var reset = require('./public/reset');

var makeOptions = require('./utils/make-options');
var makeData = require('./utils/make-data');

var render = require('./private/render');

function BasicEditor(language, options, channel) {
	var self = this;

    this.options = makeOptions(options);
    this.data = makeData(language, options);

    this.el = document.createElement('div');
	render.call(this);

	channel.on('cmd:reset', function() {
		self.reset();
	});
}

BasicEditor.prototype = {
	set: set,
	get: get,
	reset: reset
};

module.exports = BasicEditor;
