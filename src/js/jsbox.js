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
        logger: loggerEngine,
        testsList: testsListEngine,
        template: templateEngine
    }
    
};

var JSBox = {
    init: function(options) {
        this.options = extend({}, JSBoxDefaults, options || {});
        this.editors = {};
        
        initSandbox(this);
        initEditors(this);
        initLogger(this);
        initTestsList(this);
        initDOM(this);
        
        if (this.options.disabled === true) {
            this.disable();
        } else {
            this.enable();
        }
    },
    dispose: function() {
        disposeSandbox(this);
        disposeEditors(this);
        disposeLogger(this);
        disposeTestsList(this);
        disposeDOM(this);
        disposePubSub(this);
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
        this.softReset();
        resetEditors(this);
    },
    softReset: function() {
        this.testsList.reset();
        this.logger.reset();
        this.sandbox.reset();
    },
    execute: function() {
        this.softReset();
        this.sandbox.execute(boxSources(this), this.testsList.getList());
    }
};

function boxSources(box) {
    var sources = {};
    Object.keys(box.editors).forEach(function(editorName) {
        sources[editorName] = box.editors[editorName].getSource();
    });
    return sources;
}
















// ------------------------------------- //
// ---[   I N I T   S A N D B O X   ]--- //
// ------------------------------------- //
function initSandbox(box) {
    box.sandbox = box.options.engines.sandbox.create();
}

function disposeSandbox(box) {
    box.sandbox.dispose();
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

function resetEditors(box) {
    Object.keys(box.editors).forEach(function(editorName) {
        box.editors[editorName].reset();
    });
}













// ----------------------------------- //
// ---[   I N I T   L O G G E R   ]--- //
// ----------------------------------- //

function initLogger(box) {
    box.logger = box.options.engines.logger.create();
    
    ['log', 'warn', 'error'].forEach(function(type) {
        box.sandbox.on(type, function(message) {
            box.logger.push(type, message);
        });
    });
    
    box.sandbox.on('exception', function(e) {
        console.log("SANDBOX EXCEPTION", e);
    });
    
}

function disposeLogger(box) {
    box.logger.dispose();
}











// ------------------------------------------- //
// ---[   I N I T   T E S T S   L I S T   ]--- //
// ------------------------------------------- //

function initTestsList(box) {
    box.testsList = box.options.engines.testsList.create(box.options.tests);
    
    box.sandbox.on('test-result', function(test, result) {
        box.testsList.setStatus(test, result);
    });
    
}

function disposeTestsList(box) {
    box.testsList.dispose();
}









// ----------------------------- //
// ---[   I N I T   D O M   ]--- //
// ----------------------------- //

function initDOM(box) {
    box.el = dom.create('div', '', 'jsbox');
    
    // template config
    
    var templateData = {};
    
    ['sandbox','logger','testsList'].forEach(function(cmp) {
        templateData[cmp] = box[cmp].el;
    });
    
    Object.keys(box.editors).forEach(function(editorName) {
        templateData[editorName] = box.editors[editorName].el; 
    });
    
    box.template = box.options.engines.template.create(box.el, box.options.template);
    box.template.render(templateData);
    
    
    // running events
    
    box.sandbox.on('start', function(scope) {
        dom.addClass(box.el, 'jsbox-running');
    });
    
    box.sandbox.on('finish', function(scope, result) {
        dom.removeClass(box.el, 'jsbox-running');
    });
    
}

function disposeDOM(box) {
    box.template.dispose();
    dom.remove(box.el);
}










// FACTORY METHOD
function createJsbox(options) {
    var instance = Object.create(JSBox);
    instance.init(options);
    return instance;
}
