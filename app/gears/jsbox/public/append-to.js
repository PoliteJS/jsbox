/**
 * JSBox.appendTo()
 */

var $ = require('jquery');

function JSBox__appendTo(target) {
    $(target).append(this.el);
}

module.exports = JSBox__appendTo;
