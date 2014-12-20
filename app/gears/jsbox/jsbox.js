/**
 * JSBox Class Definition
 */

var subscribable = require('jqb-subscribable');

var globals = require('./globals');

// private methods
var initEditors = require('./private/init-editors');
var initCommands = require('./private/init-commands');
var initConsole = require('./private/init-console');
var initSandbox = require('./private/init-sandbox');
var initActions = require('./private/init-actions');
var render = require('./private/render');
var injectPanels = require('./private/inject-panels');
var injectCommands = require('./private/inject-commands');

var makeOptions = require('./utils/make-options');
var makeData = require('./utils/make-data');

/**
 * Constructor
 */

function JSBox(options) {
    
    this.el = document.createElement('div');
    
    this.options = makeOptions(options);
    this.data = makeData({});
    this.channel = subscribable.create();

    initEditors.call(this);
    initCommands.call(this);
    initConsole.call(this);
    initSandbox.call(this);

    render.call(this);

    injectPanels.call(this);
    injectCommands.call(this);

    initActions.call(this);
    
    this.html = this.data.panels.html;
    this.js = this.data.panels.js;
    this.css = this.data.panels.css;
    this.console = this.data.panels.console;
    this.sandbox = this.data.panels.sandbox;

    this.reset();

}

/**
 * Prototype
 */

JSBox.prototype = {
	dispose: require('./public/dispose'),
	appendTo: require('./public/append-to'),
    run: require('./public/run'),
    reset: require('./public/reset')
};

module.exports = JSBox;
