 /**
 * JSBox // private // render()
 */

var Mustache = require('mustache');

var getTemplate = require('utils/get-template');

function JSBox__render() {
	var template = getTemplate(this.options.template, this.options.custom.template);
    this.el.innerHTML = Mustache.render(template, this.data);
}

module.exports = JSBox__render;
