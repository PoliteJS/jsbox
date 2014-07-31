/**
 * Simple Text Editor Adapter
 *
 * INTERFACE:
 * execute()
 * reset()
 *
 * EVENTS:
 * start
 * finish - the code execution is done
 * success - finish + test passed
 * failure - finish + test failed
 * exception - javascript execution error
 * console - javascript console message
 */


/**
 * This is the external interface which is used by JSBox to create
 * a brand new instance. It's a factory method.
 */
var sandboxEngine = {
    create: null
};



(function() {
    
    var SandboxDefaults = {
        timeout: 10000,
        artifax: [],
        scripts: [],
        styles: []
    };
    
    var Sandbox = {
        init: function(options) {
            this.options = extend({}, SandboxDefaults, options || {});
            this.el = dom.create('div', null, 'jsbox-sandbox');
            if (options.visible === false) {
                dom.addClass(this.el, 'jsbox-sandbox-hidden');
            }
            this.reset(true);
        },
        dispose: function() {
            removeIframe(this);
            disposePubSub(this);
            this.el = null;
        },
        on: function(e, cb) {
            subscribe(this, e, cb);
        },
        execute: function(source, tests) {
            this.reset(true);
            execute(this, source, tests);
        },
        reset: function(silent) {
            removeIframe(this);
            createIframe(this);
            if (silent !== true) {
                publish(this, 'reset');
            }
        }
    };
    
    
    
    
    
    function execute(box, source, tests) {
        
        var scope = box.iframe.contentWindow;
        var async = false;
        
        publish(box, 'start', scope);
        
        source = extend({
            js: '',
            css: '',
            html: ''
        }, source);
        
        fakeConsole(box, scope);
        
        scope.sandboxSourceErrors = function(e) {
            publish(box, 'exception', e);
        };
        
        scope.jsboxTest = function() {
            test(box, scope, tests);
        };
        
        scope.jsboxSyncEnd = function() {
            // auto detect async code
            if (!async && source.js.indexOf('jsboxTest()') !== -1) {
                async = true;
            }
            if (!async) {
                scope.jsboxTest();
            }
        };
        
        scope.jsboxAsync = function() {
            async = true;
            return scope.jsboxTest;
        };
        
        // create external CSS libraries list
        var styles = '';
        box.options.styles.forEach(function(style) {
            styles += '<link rel="stylesheet" href="' + styleLibraryUrl(style) + '"></script>';
        });
        
        // create external Javascript libraries list
        var scripts = '';
        box.options.scripts.forEach(function(script) {
            scripts += '<script src="' + scriptLibraryUrl(script) + '"></script>';
        });
        
        // create the list of artifax
        var artifax = '';
        box.options.artifax.forEach(function(code) {
            artifax += '<script>try {' + code + '\n} catch(e) {}</script>';
        });
        
        
        
        scope.document.open();
        scope.document.write([
            '<html><head>',
            styles,
            '<style>' + source.css + '\n</style>',
            scripts,
            artifax,
            '</head><body>',
            source.html + '\n',
            '<script>',
            'try {' + source.js + '\n} catch(e) {sandboxSourceErrors(e)};',
            'jsboxSyncEnd();',
            '</script></body></html>'
        ].join(''));
        scope.document.close();
    }
    
    /**
     * fullResult starts to be "null" because jsboxes with no tests
     * shouldn't have any outcome class.
     */
    function test(sandbox, scope, tests) {
        var fullResult = null;
        
        tests.forEach(function(test, index) {
            
            scope.sandboxTestResultsHandler = function(partialResult) {
                publish(sandbox, 'test-result', test, partialResult, index, scope);
                if (fullResult === null) {
                    fullResult = partialResult;
                } else {
                    fullResult = fullResult && partialResult;
                }
            };

            var script = document.createElement('script');
            script.appendChild(document.createTextNode('try {sandboxTestResultsHandler(' + test + ')} catch (e) {sandboxTestResultsHandler(false)}'));
            scope.document.body.appendChild(script);

        });
        
        publish(sandbox, 'finish', scope, fullResult);
    }
    
    
    
    
    /**
     * External libraries name parser
     * @TODO: it should support short names like 
     *    "jquery", 
     *    "jquery@2.1.1", 
     *    "backbone", 
     *    "$", 
     *    "_", 
     *    "$@2.1.1",
     *    "name@version"
     *
     * or it send back the full url as it is specified
     */
    
    function scriptLibraryUrl(name) {
        return name;
    }
    
    function styleLibraryUrl(name) {
        return name;
    }
    
    
    
    
    
    
    
    
    
    
    function createIframe(sandbox) {
        sandbox.iframe = dom.create('iframe', null, 'jsbox-sandbox-runner');
        dom.append(sandbox.iframe, sandbox.el);
    }
    
    function removeIframe(sandbox) {
        if (sandbox.iframe) {
            dom.remove(sandbox.iframe);
            sandbox.iframe = null;
        }
    }
    
    
    
    
    
    
    
    // ------------------------------------- //
    // ---[   F A K E   C O N S O L E   ]--- //
    // ------------------------------------- //
    
    function fakeConsole(sandbox, scope) {
        scope.console = {};
        ['log','warn','error'].forEach(function(type) {
            scope.console[type] = function() {
                var args = Array.prototype.slice.call(arguments);
                publish(sandbox, type, consoleLogArgs(args), args); 
            };
        });
        scope.console['assert'] = function(assertion, msg) {
            if (assertion === true) {
                publish(sandbox, 'assertion-passed', msg); 
            } else {
                publish(sandbox, 'assertion-failed', msg); 
            }
        };
    }
    
    function consoleLogArgs(args) {
        return args.map(consoleLogArg).join(', ');
    };

    function consoleLogArg(item) {
        
        switch (typeof item) {
            case 'string':
                return '"' + item + '"';
            case 'object':
                if (Object.prototype.toString.call(item) === '[object Date]') {
                    return item.toString();
                } else if (Array.isArray(item)) {
                    return '[' + item.map(consoleLogArg).join(', ') + ']';
                } else {
                    return '{' + Object.keys(item).map(function(key) {
                        return key + ':' + consoleLogArg(item[key]);
                    }).join(', ') + '}';
                }
            case 'function':
                return item.toString();
            case 'boolean':
                return item.toString().toUpperCase();
        }
        return item;
    }
    
    
    
    
    
    
    
    
    // Factory Method
    sandboxEngine.create = function(options) {
        var instance = Object.create(Sandbox);
        instance.init(options);
        return instance;
    };

})();
