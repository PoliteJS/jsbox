
var get = require('./public/get');
var set = require('./public/set');

var makeOptions = require('./private/make-options');
var makeData = require('./private/make-data');
var render = require('./private/render');

function BasicEditor(language, options) {

    options = makeOptions(options);
    var data = makeData(language, options);

    this.el = document.createElement('div');
	render(options, data, this.el);
}

BasicEditor.prototype = {
	set: set,
	get: get
};

module.exports = BasicEditor;
