
var JSBox = require('jsbox/jsbox');

function createJSBox(options) {
	options = options || {};
    var box = new JSBox(options);

    // append the box to it's target if configured so
    if (options.target) {
    	box.appendTo(options.target);
    }

    return box;
}

module.exports = createJSBox;
