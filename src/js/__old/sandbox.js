var defaultSandbox = (function() {
        
    var sandbox = {
        init: function(el) {
            this.el = el;
            _sandbox = this;
        },
        dispose: function() {},
        on: function(e, cb) {
            subscribe(this, e, cb);
        },
        reset: function() {
            publish(this, 'reset');
            return this;
        },
        run: function(source, tests, callback) {
            var self = this;

            // test for syntax error in source code
            try {
                var fn = new Function(source);  
            } catch(e) {
                publish(this, 'exception', e);
                publish(this, 'stop');
                return;
            }

            var publishEvent = function() {
                var args = Array.prototype.slice.call(arguments);
                args.unshift(self);
                publish.apply(null, args);
            };

            // execute source and tests
            publish(this, 'start');
            execute(this.el, source, tests, publishEvent, function(test, index, result) {
                publish(self, 'stop');
                publish(self, result ? 'success' : 'failure', index, test);
            }, callback);
        }
    };

    function execute(target, source, tests, publishEvent, testCallback, sandboxCallback) {

        // one shot iframe where to run the code and tests
        var box = document.createElement('iframe');
        target.appendChild(box);

        var async = false;
        var scope = box.contentWindow;
        var body = scope.document.body;
        var source = 'try {' + source + '} catch(e) { sandboxCatchErrors(e); }';

        scope.sandboxCatchErrors = function(e) {
            publishEvent('exception', e);
        };

        scope.console = {
            log: function() {
                consolePublish('log', arguments);
            },
            warn: function() {
                consolePublish('warn', arguments);
            },
            error: function() {
                consolePublish('error', arguments);
            }
        };

        scope.async = function() {
            async = true;
            return test;
        };

        function consolePublish(event, args) {
            var args = Array.prototype.slice.call(args);
            publishEvent('console', event, log2string(args), args); 
        }

        function test() {
            var _result = true;
            tests.forEach(function(test, index) {
                scope.sandboxTestResultsHandler = function(result) {
                    testCallback.call(scope, test, index, result);
                    _result = _result && result;
                };
                makeScriptEl('try {sandboxTestResultsHandler(' + test + ');} catch (e) {sandboxTestResultsHandler(false);}', body);
            });
            target.removeChild(box);
            sandboxCallback(_result);
        }


        // run the source code and test
        makeScriptEl(source, body);
        if (!async) {
            test()
        }
    }

    function makeScriptEl(source, target) {
        var el = document.createElement('script');
        el.type = 'text/javascript';
        el.appendChild(document.createTextNode(source));
        if (target) {
            target.appendChild(el);
        }
        return el;
    }

    function log2string(args) {
        return args.map(logItem).join(', ');
    };

    function logItem(item) {
        switch (typeof item) {
            case 'string':
                return '"' + item + '"';
            case 'object':
                if (Object.prototype.toString.call(item) === '[object Date]') {
                    return item.toString();
                } else if (Array.isArray(item)) {
                    return '[' + item.map(logItem).join(', ') + ']';
                } else {
                    return '{' + Object.keys(item).map(function(key) {
                        return key + ':' + logItem(item[key]);
                    }).join(', ') + '}';
                }
            case 'function':
                return item.toString();
            case 'boolean':
                return item.toString().toUpperCase();
        }
        return item;
    }

    return sandbox;

})();