 /**
 * BasicSandbox // private // render()
 */

var $ = require('jquery');
var Mustache = require('mustache');

function BasicSandbox__render() {
	var $el = $(this.el);
    
    $el.addClass('jsbox-sandbox');
    $el.addClass('jsbox-basic-sandbox');

    $el.html('Basic Sandbox');	
}

module.exports = BasicSandbox__render;
