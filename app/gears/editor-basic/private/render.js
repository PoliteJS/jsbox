 /**
 * BasicEditor // private // render()
 */

var $ = require('jquery');
var Mustache = require('mustache');

function BasicEditor__render() {
	var $el = $(this.el);

    $el.html(Mustache.render(this.options.template, this.data));
    
    $el.addClass('jsbox-editor');
    $el.addClass('jsbox-editor-' + this.data.language);
    $el.addClass('jsbox-basic-editor');
    $el.addClass('jsbox-basic-editor-' + this.data.language);
}

module.exports = BasicEditor__render;
