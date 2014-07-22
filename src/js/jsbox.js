/**
 * JSBox
 */

var JSBoxDefaults = {
    
    disabled: false,
    template: null,
    
    // editors
    editors: {
        html: '',
        css: '',
        js: ''
    },
    
    // tests list
    tests: [],
    
    // adapter injection
    engines: {
        editor: textEditorEngine,
        sandbox: sandboxEngine,
        template: templateEngine
    }
    
};

var JSBox = {
    init: function(options) {
        this.options = extend({}, JSBoxDefaults, options || {});
        this.editors = {};
        this.tests = this.options.tests || [];
        
        initDOM(this);
        
        initEditors(this);
        
        initSandbox(this);
        
        initTemplate(this);
        
        if (this.options.disabled === true) {
            this.disable();
        } else {
            this.enable();
        }
    },
    dispose: function() {
        disposeEditors(this);
        disposeSandbox(this);
        disposePubSub(this);
        disposeTemplate(this);
        disposeDOM(this);
    },
    on: function(event, handler) {
        subscribe(this, event, handler);
    },
    getEl: function() {
        return this.el;
    },
    enable: function() {
        this.isEnabled = true;
        dom.addClass(this.el, 'jsbox-enabled');
        dom.removeClass(this.el, 'jsbox-disabled');
    },
    disable: function() {
        this.isEnabled = false;
        dom.removeClass(this.el, 'jsbox-enabled');
        dom.addClass(this.el, 'jsbox-disabled');
    },
    reset: function() {
        console.log('reset');
    },
    execute: function() {
        var box = this;
        
        // sandbox context
        var sources = {};
        
        // populate the sandbox source code
        Object.keys(box.editors).forEach(function(editorName) {
            sources[editorName] = box.editors[editorName].getSource();
        });
        
        console.log(this.tests);
        this.sandbox.execute(sources, this.tests);
    }
};





// ----------------------------- //
// ---[   I N I T   D O M   ]--- //
// ----------------------------- //

function initDOM(box) {
    box.el = dom.create('div', '', 'jsbox');
}

function disposeDOM(box) {
    dom.remove(box.el);
}












// ------------------------------------- //
// ---[   I N I T   E D I T O R S   ]--- //
// ------------------------------------- //

function initEditors(box) {
    Object.keys(box.options.editors).forEach(function(editorName) {
        if (box.options.editors[editorName] === false) {
            return;
        }
        var source = '';
        if (typeof box.options.editors[editorName] === 'string') {
            source = box.options.editors[editorName];
        }
        box.editors[editorName] = box.options.engines.editor.create({
            language: editorName,
            source: source
        });
        box.editors[editorName].on('cmd-execute', box.execute.bind(box));
        box.editors[editorName].on('cmd-reset', box.reset.bind(box));
    });
}

function disposeEditors(box) {
    Object.keys(box.editors).forEach(function(editorName) {
        box.editors[editorName].dispose();
    });
    box.editors = null;
}






// ------------------------------------- //
// ---[   I N I T   S A N D B O X   ]--- //
// ------------------------------------- //
function initSandbox(box) {
    box.sandbox = box.options.engines.sandbox.create({});
    
    box.sandbox.on('test-result', function(test, result) {
        console.log(test, result);
    });
    
    box.sandbox.on('finish', function(scope, result) {
        console.log(scope.document.body, result);
    });
}

function disposeSandbox(box) {
    box.sandbox.dispose();
}








// -------------------------------------- //
// ---[   I N I T  T E M P L A T E   ]--- //
// -------------------------------------- //

function initTemplate(box) {
    var templateData = {};
    
    templateData['sandbox'] = box.sandbox.el;
    
    Object.keys(box.editors).forEach(function(editorName) {
        templateData[editorName] = box.editors[editorName].el; 
    });
    
    box.template = box.options.engines.template.create(box.el, box.options.template);
    box.template.render(templateData);
}

function disposeTemplate(box) {
    box.template.dispose();
}






// FACTORY METHOD
function createJsbox(options) {
    var instance = Object.create(JSBox);
    instance.init(options);
    return instance;
}
