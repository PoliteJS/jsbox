

var makeOptions = require('./utils/make-options');
var makeData = require('./utils/make-data');

var render = require('./private/render');

function BasicEditor(language, options, channel) {
	var self = this;

    this.options = makeOptions(options);
    this.data = makeData(language, options);

    this.el = document.createElement('div');
	render.call(this);
}

BasicEditor.prototype = {
	set: require('./public/set'),
	get: require('./public/get'),
	reset: require('./public/reset'),
	dispose: require('./public/dispose')
};

module.exports = BasicEditor;
