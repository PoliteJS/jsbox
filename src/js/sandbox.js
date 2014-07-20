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


var createSandbox;

(function() {
    
    var SandboxDefaults = {
        timeout: 10000
    };
    
    var Sandbox = {
        init: function(options) {
            this.options = extend({}, SandboxDefaults, options || {});
            this.el = dom.create('div', null, 'jsbox-sandbox');
            $(this.el).append('<b>sandbox</b>'); //
            this.reset();
        },
        dispose: function() {
            disposePubSub(this);
            this.el = null;
        },
        on: function(e, cb) {
            subscribe(this, e, cb);
        },
        execute: function(source, tests) {
            this.reset();
            execute(this, source, tests);
        },
        reset: function(silent) {
            if (this.iframe) {
                dom.remove(this.iframe);
                this.iframe = null;
            }
            this.iframe = dom.create('iframe', null, 'jsbox-sandbox-runner');
            dom.append(this.iframe, this.el);
            if (silent !== true) {
                publish(this, 'reset');
            }
        }
    };
    
    
    
    
    function execute(box, source, tests) {
        
        var scope = box.iframe.contentWindow;
        var async = false;
        
        publish(box, 'start');
        
        source = extend({
            js: '',
            css: '',
            html: ''
        }, source);
        
        // test for syntax error in source code
        try {
            var fn = new Function(source.js);
        } catch(e) {
            publish(this, 'exception', e);
            publish(this, 'finish', scope);
            return;
        }
        
        function runTests() {
            var _result = true;
            tests.forEach(function(test, index) {
                box.iframe.contentWindow.sandboxTestResultsHandler = function(result) {
                    publish(box, 'test-result', test, result, index, scope);
                    _result = _result && result;
                };
                
                var script = document.createElement('script');
                script.appendChild(document.createTextNode('try {sandboxTestResultsHandler(' + test + ');} catch (e) {sandboxTestResultsHandler(false);}'));
                scope.document.body.appendChild(script);
                
            });
            publish(box, 'finish', scope, _result);
            publish(box, _result ? 'success' : 'failure', scope);
        }
        
        scope.sandboxCatchErrors = function(e) {
            console.log("ERROR", e);
        };
        
        scope.async = function() {
            async = true;
            return runTests.bind(scope);
        };
        
        scope.asyncEnd = function() {
            runTests.call(scope);
        };
        
        scope.syncEnd = function() {
            if (!async) {
                runTests.call(scope);
            }
        };
        
        scope.document.open();
        scope.document.write([
            '<html><head><style>',
            source.css,
            '</style></head><body>',
            source.html,
            '<script>',
            'try {' + source.js + '} catch(e) { sandboxCatchErrors(e); };',
            'syncEnd();',
            '</script></body></html>'
        ].join(''));
        scope.document.close();
    }
    
    // Factory Method
    createSandbox = function(options) {
        var instance = Object.create(Sandbox);
        instance.init(options);
        return instance;
    };

})();
