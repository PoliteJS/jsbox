/**
 * JSBox
 */

var JSBoxDefaults = {
    
    autorun: false,
    
    disabled: false,
    disabledMsg: 'please complete the previous exercise!',
    
    // editors
    editors: {
        html: false,
        css: false,
        js: false
    },
    
    sandbox: {
        visible: false
    },
    
    // tests list
    tests: [],
    
    // adapter injection
    engines: {
        editor: window.ace ? aceEditorEngine : textEditorEngine,
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
        initSystemLogger(this);
        initUserLogger(this);
        initTestsList(this);
        initDOM(this);
        
        // status flags
        this.__enabled = false;
        this.__active = false;
        
        if (this.options.disabled === true) {
            this.setEnabled(false);
        } else {
            this.setEnabled(true);
        }
        
        if (this.options.autorun === true) {
            setTimeout(this.execute.bind(this), 0);
        }
    },
    dispose: function() {
        publish(this, 'dispose');
        disposeSandbox(this);
        disposeEditors(this);
        disposeSystemLogger(this);
        disposeUserLogger(this);
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
    setEnabled: function(status) {
        var self = this;
        var oldValue = this.__enabled;
        this.__enabled = status === true ? true : false;
        
        clearTimeout(this._setEnabledTimer);
        this._setEnabledTimer = setTimeout(function() {
            if (oldValue !== self.active) {
                publish(self, 'enabled-status-changed', self.__enabled, oldValue);
            }
        }, 50);
    },
    setActive: function(status) {
        var self = this;
        var oldValue = this.__active;
        this.__active = status === true ? true : false;
        
        clearTimeout(this._setActiveTimer);
        this._setActiveTimer = setTimeout(function() {
            if (oldValue !== self.active) {
                publish(self, 'active-status-changed', self.__active, oldValue);
            }
        }, 50);
    },
    reset: function() {
        dom.removeClass(this.el, 'jsbox-running');
        this.setActive(true);
        this.softReset();
        resetEditors(this);
        publish(this, 'reset');
    },
    softReset: function() {
        this.testsList.reset();
        this.systemLogger.reset();
        this.userLogger.reset();
        this.sandbox.reset();
    },
    execute: function() {
        this.setActive(true);
        this.softReset();
        this.sandbox.execute(boxSources(this), this.testsList.getList());
    },
    isActive: function() {
        return this.__active;
    },
    isEnabled: function() {
        return this.__enabled;
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
    box.sandbox = box.options.engines.sandbox.create(box.options.sandbox);
    box.sandbox.on('finish', function(scope, result) {
        if (result === true) {
            setTimeout(function() {
                publish(box, 'success', box);
            }, 0);
        }
        if (result === false) {
            setTimeout(function() {
                publish(box, 'error', box);
            }, 0);
        }
        setTimeout(function() {
            publish(box, 'status', box, result, scope);
        }, 0);
    });
}

function disposeSandbox(box) {
    box.sandbox.dispose();
}










// ------------------------------------- //
// ---[   I N I T   E D I T O R S   ]--- //
// ------------------------------------- //

function initEditors(box) {
    var supportedEditors = ['js','css','html'];
    Object.keys(box.options.editors).filter(function(editorName) {
        return supportedEditors.indexOf(editorName) !== -1;
    }).forEach(function(editorName) {
        if (box.options.editors[editorName] === false) {
            return;
        }
        var source = '';
        if (typeof box.options.editors[editorName] === 'string') {
            source = box.options.editors[editorName];
        }
        var options = {
            language: editorName,
            source: source,
            autosize: box.options.editors.autosize,
            minHeight: box.options.editors.minHeight,
            maxHeight: box.options.editors.maxHeight
        };
        box.editors[editorName] = box.options.engines.editor.create(options);
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

function initUserLogger(box) {
    box.userLogger = box.options.engines.logger.create();
    
    ['log', 'warn', 'error', 'assertion-passed', 'assertion-failed'].forEach(function(type) {
        box.sandbox.on(type, function(message) {
            box.userLogger.push(type, message);
        });
    });
    
    box.sandbox.on('exception', function(e) {
        box.userLogger.push('exception', e.message);
    });
    
}

function disposeUserLogger(box) {
    box.userLogger.dispose();
}

function initSystemLogger(box) {
    box.systemLogger = box.options.engines.logger.create();
    
    ['hint'].forEach(function(type) {
        box.sandbox.on(type, function(message) {
            box.systemLogger.push(type, message);
        });
    });
    
}

function disposeSystemLogger(box) {
    box.systemLogger.dispose();
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
    box.template = box.options.engines.template.create(box);
}

function disposeDOM(box) {
    box.template.dispose();
    dom.remove(box.el);
}





/**
 * INSTANCES REPOSITORY
 */
var jsboxes = [];


/**
 * FACTORY METHOD
 */
function createJsbox(options) {
    var instance = Object.create(JSBox);
    instance.init(options);
    jsboxes.push(instance);
    
    // deactivate every "other" active box
    instance.on('active-status-changed', function(status) {
        if (!status) {
            return;
        }
        jsboxes.filter(function(box) {
            return box !== instance;
        }).forEach(function(box) {
            box.setActive(false);
        });
    });
    
    // remove the box from the repository
    instance.on('dispose', function(box) {
        var index = jsboxes.indexOf(instance);
        if (index !== -1) {
            jsboxes.splice(index, 1);
        }
    });
    
    return instance;
}
