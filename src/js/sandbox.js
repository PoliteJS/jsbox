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
        scripts: [],
        styles: [],
        artifacts: []
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
        
        publish(box, 'start', scope);
        
        source = extend({
            js: '',
            css: '',
            html: ''
        }, source);
        
        
        jsboxScope(box, scope, source, tests);
        jsboxConsole(box, scope);
        
        
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
        var artifacts = '';
        box.options.artifacts.forEach(function(artifact) {
            artifacts += '<script>try {' + artifact + '\n} catch(e) {}</script>';
        });
        
        // ChaiJS Integration
        var supportChaiJS = [
            '<script>',
            'if(window.chai){',
                'window.expect=window.chai.expect;',
                'window.should=window.chai.should;',
                'window.assert=window.chai.assert;',
            '}</script>'
        ].join('');
        
        
        // heavvy syntax errors handler
        // this timeout is cleared in `jsbox.syncEnd`
        box.codeErrorTimeout = setTimeout(function() {
            scope.document.write('');
            publish(box, 'exception', {message:'<b>Check your Javascript!</b><br>it contains a really bad syntax error!'});
            publish(box, 'finish', scope, false);
        }, 1000);

        scope.document.open();
        scope.document.write([
            '<html><head>',
            styles,
            '<style>' + source.css + '\n</style>',
            scripts,
            supportChaiJS,
            artifacts,
            '</head><body>',
            source.html + '\n',
            '<script>',
            'try {' + source.js + '\n} catch(e) {jsbox.sandboxSourceErrors(e)};',
            'jsbox.syncEnd();',
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
            
            scope.sandboxTestResultsHandler = function(partialResult, e) {
                // handle ChaiJS exceptions
                if (e && scope.chai && e instanceof scope.chai.AssertionError) {
                    publish(sandbox, 'chai-exception', e);
                }
                publish(sandbox, 'test-result', test, partialResult, index, scope);
                if (fullResult === null) {
                    fullResult = partialResult;
                } else {
                    fullResult = fullResult && partialResult;
                }
            };

            var script = document.createElement('script');
            script.appendChild(document.createTextNode('try {sandboxTestResultsHandler(' + test + ')} catch (e) {sandboxTestResultsHandler(false, e)}'));
            scope.document.body.appendChild(script);

        });
        
        publish(sandbox, 'finish', scope, fullResult);
    }
    
    
    
    /**
     * create the "jsbox" object into the sandbox's execution scope.
     */
    function jsboxScope(sandbox, scope, source, tests) {
        var async = false;
        scope.jsbox = {
            source: {
                js: source.js,
                css: source.css,
                html: source.html
            },
            hint: function(message, show) {
                if (typeof show !== 'boolean') {
                    show = true;
                }
                if (show) {
                    publish(sandbox, 'hint', message); 
                }
            },
            sandboxSourceErrors: function(e) {
                publish(sandbox, 'exception', e);
            },
            test: function() {
                test(sandbox, scope, tests);
            },
            syncEnd: function() {
                // clear bad errors handling timer
                clearTimeout(sandbox.codeErrorTimeout);
                // auto detect async code
                if (!async && source.js.indexOf('jsbox.test') !== -1) {
                    async = true;
                }
                if (!async) {
                    scope.jsbox.test();
                }
            },
            async: function() {
                async = true;
                return scope.test;
            }
        };
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
        var version = '';
        if (name.indexOf('//') !== -1 || name.indexOf('.js') !== -1) {
            return name;
        }
        if (name.indexOf('@') !== -1) {
            var tokens = name.split('@');
            var version = tokens[1];
            name = tokens[0];
        }
        
        switch (name) {
            case 'sinonjs':
            case 'sinon':
                version = version || '1.7.3';
                name = '//cdnjs.cloudflare.com/ajax/libs/sinon.js/@@@/sinon-min.js';
                break;
            
            case 'jquery':
            case 'jq':
            case '$':
                version = version || '2.1.1';
                name = '//cdnjs.cloudflare.com/ajax/libs/jquery/@@@/jquery.min.js';
                break;
         
            case 'underscore':
            case '_':
                version = version || '1.6.0';
                name = '//cdnjs.cloudflare.com/ajax/libs/underscore.js/@@@/underscore-min.js';
                break;
            
            case 'knockoutjs':
            case 'knockout':
            case 'ko':
                version = version || '3.2.0';
                name = '//cdnjs.cloudflare.com/ajax/libs/knockout/@@@/knockout-min.js';
                break;
            
            case 'backbonejs':
            case 'backbone':
                version = version || '1.1.2';
                name = '//cdnjs.cloudflare.com/ajax/libs/backbone.js/@@@/backbone-min.js';
                break;
            
            case 'mochajs':
            case 'mocha':
                version = version || '1.20.1';
                name = '//cdnjs.cloudflare.com/ajax/libs/mocha/@@@/mocha.js';
                break;
            
            case 'chaijs':
            case 'chai':
                version = version || '1.9.1';
                name = '//cdnjs.cloudflare.com/ajax/libs/chai/@@@/chai.min.js';
                break;
                
        }
        
        return name.replace('@@@',version);
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
    
    
    
    
    
    
    
    
    
    
    
    
    
    // --------------------------------------- //
    // ---[   J S B O X   C O N S O L E   ]--- //
    // --------------------------------------- //
    
    function jsboxConsole(sandbox, scope) {
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
