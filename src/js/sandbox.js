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
        timeout: 10000
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
        
        scope.asyncEnd = function() {
            test(box, scope, tests);
        };
        
        scope.syncEnd = function() {
            if (!async) {
                scope.asyncEnd();
            }
        };
        
        scope.async = function() {
            async = true;
            return scope.asyncEnd;
        };
        
        scope.document.open();
        scope.document.write([
            '<html><head><style>',
            source.css,
            '</style></head><body>',
            source.html,
            '<script>',
            'try {' + source.js + '} catch(e) {sandboxSourceErrors(e)};',
            'syncEnd();',
            '</script></body></html>'
        ].join(''));
        scope.document.close();
    }
    
    
    function test(sandbox, scope, tests) {
        var fullResult = true;
        
        tests.forEach(function(test, index) {
            
            scope.sandboxTestResultsHandler = function(partialResult) {
                publish(sandbox, 'test-result', test, partialResult, index, scope);
                fullResult = fullResult && partialResult;
            };

            var script = document.createElement('script');
            script.appendChild(document.createTextNode('try {sandboxTestResultsHandler(' + test + ')} catch (e) {sandboxTestResultsHandler(false)}'));
            scope.document.body.appendChild(script);

        });
        
        publish(sandbox, 'finish', scope, fullResult);
        publish(sandbox, fullResult ? 'success' : 'failure', scope);
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
