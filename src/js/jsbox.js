/**
 * JSBox
 */

var JSBoxDefaults = {
    
    // editors
    editors: {
        html: '<p>a paragraph</p>',
        css: 'p { color: blue }',
        js: 'document.querySelector("p").innerHTML = "foo";'
    },
    
    // adapter injection
    editorFactory: createTextEditor,
    sandboxFactory: createSandbox
};

var JSBox = {
    init: function(options) {
        this.options = extend({}, JSBoxDefaults, options || {});
        this.editors = {};
        console.log('init instance', options);
        
        initDOM(this);
        
        initEditors(this);
        
        initSandbox(this);
        
        this.enable();
    },
    dispose: function() {
        console.log("DISPOSE");
        disposeEditors(this);
        disposeDOM(this);
        disposeSandbox(this);
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
        console.log('reset');
    },
    execute: function() {
        var box = this;
        
        var run = {
            source: {},
            tests: ['a == true', 'a === true']
        };
        
        Object.keys(box.editors).forEach(function(editorName) {
            run.source[editorName] = box.editors[editorName].getSource();
        });
        
        this.sandbox.execute(run.source, run.tests);
    }
};







function initDOM(box) {
    box.el = dom.create('div', '', 'jsbox', 'mona');
}

function disposeDOM(box) {
    dom.remove(box.el);
}


function initEditors(box) {
    Object.keys(box.options.editors).forEach(function(editorName) {
        if (box.options.editors[editorName] === false) {
            return;
        }
        box.editors[editorName] = box.options.editorFactory({
            language: editorName,
            source: box.options.editors[editorName]
        });
        box.editors[editorName].on('cmd-execute', box.execute.bind(box));
        box.editors[editorName].on('cmd-reset', box.reset.bind(box));
        
        dom.append(box.editors[editorName].el, box.el);
    });
}

function disposeEditors(box) {
    Object.keys(box.editors).forEach(function(editorName) {
        box.editors[editorName].dispose();
    });
    box.editors = null;
}




function initSandbox(box) {
    box.sandbox = box.options.sandboxFactory({});
    dom.append(box.sandbox.el, box.el);
    
    box.sandbox.on('test-result', function(test, result) {
        console.log(test, result);
    });
    
    box.sandbox.on('finish', function(scope, result) {
        console.log(scope.document.body, result);
    });
}

function disposeSandbox() {
    box.sandbox.dispose();
}






// FACTORY METHOD
function createJsbox(options) {
    var instance = Object.create(JSBox);
    instance.init(options);
    return instance;
}
