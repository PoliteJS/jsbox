 /**
 * BasicEditor // private // render()
 */

var $ = require('jquery');
var Mustache = require('mustache');

function BasicEditor__render(options, data, el) {
	var $el = $(el);

    $el.html(Mustache.render(options.template, data));
    
    $el.addClass('jsbox-editor');
    $el.addClass('jsbox-editor-' + data.language);
    $el.addClass('jsbox-basic-editor');
    $el.addClass('jsbox-basic-editor-' + data.language);
}

module.exports = BasicEditor__render;
