/**
 * JSBox.dispose()
 */

var $ = require('jquery');

function JSBox__dispose(target) {
	this.channel.dispose();
    $(this.el).remove();
}

module.exports = JSBox__dispose;
