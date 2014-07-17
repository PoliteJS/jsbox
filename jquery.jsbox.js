/**
 * JSBox - jQuery Plugin
 * marco pegoraro -at gmail | @thepeg | movableapp.com
 *
 */

;(function($) {
    
    
    
    // ---------------------------------------------- //
    // ---[   J S B O X   M A I N   L O G I C   ] --- //
    // ---------------------------------------------- //
    
    var JSBox = {
        init: function(el, config) {
            this.el = el;
            this.$el = $(this.el);
            this.config = config;
            this.status = false;
            
            this.source = '';
            loadSourceCode(this);
            
            this.tests = [];
            loadTestCode(this);
            
            initDOM(this);
            initEditor(this);
            initSandbox(this);
        },
        dispose: function() {
            disposeDOM(this);
            disposeEditor(this);
            disposeSandbox(this);
        },
        on: function(event, handler) {
            subscribe(this, event, handler);
        },
        enable: function() {
            this.$el.removeClass('jsbox-disabled');
        },
        disable: function() {
            this.$el.addClass('jsbox-disabled');
        },
        setSource: function(source) {
            this.source = source;
            this.editor.setSource(this.source);
        },
        reset: function() {
            this.sandbox.reset();
            this.setSource(this._originalSource);
        },
        run: function() {
            var self = this;
            this.status = false;
            this.sandbox.reset().run(this.source, this.tests, function(result) {
                self.status = result;
                publish(self, 'status', self.status);
            });
        }
    };
    
    function loadSourceCode(box) {
        if (!box.config.code && box.config.codeQuery) {
            box.source = box.$el.find(box.config.codeQuery).text();
        } else {
            box.source = box.config.code;
        }
        box._originalSource = box.source;
    };
    
    function loadTestCode(box) {
        if (!box.config.tests.length && box.config.testsQuery) {
            box.tests = []
            box.$el.find(box.config.testsQuery).each(function() {
                box.tests.push($(this).text());
            });
        } else {
            box.tests = box.config.tests;
        }
    };
    
    // DOM
    function initDOM(box) {
        box._originalHTML = box.$el.html();
        box.$el.empty().addClass('jsbox-widget');
        
        box.$editor = $('<div class="jsbox-editor">');
        
        box.$tests = $('<ul class="jsbox-test">');
        box.tests.forEach(function(test) {
            box.$tests.append($('<li>').text(test));
        });
        
        box.$sandbox = $('<div class="jsbox-sandbox">');
        box.$exception = $('<div class="jsbox-exception">');
        box.$console = $('<ul class="jsbox-console">');
        
        box.$runBtn = $('<button>').text('run');
        box.$resetBtn = $('<button>').text('reset');
        
        box.$runBtn.on('click', box.run.bind(box));
        box.$resetBtn.on('click', box.reset.bind(box));
        
        box.$overlay = $('<div class="jsbox-overlay">');
        box.$overlay.append('<p>solve the previous exercise to unlock!</p>');
        
        // place items into a template???
        box.$el
            .append(box.$tests)
            .append(box.$editor)
            .append(box.$sandbox)
            .append(box.$exception)
            .append(box.$console)
            .append(box.$runBtn)
            .append(box.$resetBtn)
            .append(box.$overlay);
    }
    
    function disposeDOM(box) {
        box.$runBtn.off();
        box.$resetBtn.off();
        box.$el
            .empty()
            .removeClass('jsbox-widget')
            .html(box._originalHTML);
    }
    
    // EDITOR
    function initEditor(box) {
        var editor = box.config.editor || defaultEditor;
        box.editor = Object.create(editor);
        box.editor.init(box.$editor, box.setSource.bind(box), box.source, box.config.updateDelay);
        box.editor.on('cmd-run', box.run.bind(box));
        box.editor.on('cmd-reset', box.reset.bind(box));
    }
    
    function disposeEditor(box) {
        box.editor.dispose();
        box.editor = null;
    }
    
    // TEST RUNNER
    function initSandbox(box) {
        var sandbox = box.config.sandbox || defaultSandbox;
        box.sandbox = Object.create(sandbox);
        box.sandbox.init(box.$sandbox[0]);
        
        box.sandbox.on('start', function(index) {
            box.$tests.addClass('running');
        });
        box.sandbox.on('stop', function(index) {
            box.$tests.removeClass('running');
        });
        box.sandbox.on('success', function(index) {
            box.$tests.find(':eq(' + index + ')').addClass('success');
        });
        box.sandbox.on('failure', function(index) {
            box.$tests.find(':eq(' + index + ')').addClass('failure');
        });
        box.sandbox.on('reset', function() {
            box.$exception.html('').hide();
            box.$console.html('').hide();
            box.$tests.find('.success').removeClass('success');
            box.$tests.find('.failure').removeClass('failure');
        });
        box.sandbox.on('exception', function(e) {
            box.$exception.html(e.message).show();
        });
        box.sandbox.on('console', function(evt, log) {
            $('<li>').addClass(evt).text(log).appendTo(box.$console);
            box.$console.show();
        });
        
        box.sandbox.reset();
    }
    
    function disposeSandbox(box) {
        box.sandbox.dispose();
        box.sandbox = null;
    }
    
    
    
    
    
    
    
    // ----------------------------------------------- //
    // ---[   P U B / S U B   U T I L I T I E S   ]--- //
    // ----------------------------------------------- //
    
    function subscribe(obj, event, cb) {
        if (!obj._subscriptions) {
            obj._subscriptions = {};
        }
        if (!obj._subscriptions[event]) {
            obj._subscriptions[event] = [];
        }
        obj._subscriptions[event].push(cb);
    }
    
    function publish(obj, event) {
        var args = Array.prototype.slice.call(arguments);
        args.shift();
        args.shift();
        if (obj._subscriptions && obj._subscriptions[event]) {
            obj._subscriptions[event].forEach(function(cb) {
                cb.apply(obj, args);
            });
        }
    }
    
    
    
    
    
    
    // --------------------------------------------------------- //
    // ---[   D E F A U L T   E D I T O R   A D A P T E R   ]--- //
    // --------------------------------------------------------- //
    
    /*
     * implements a simple textarea wich trigger an update callback
     * with the current code.
     */
    
    var defaultEditor = (function() {
        
        var editor = {
            init: function($target, updateFn, source, delay) {
                var self = this;
                var timer;
                var delay = delay || 250;

                this.$ui = $('<textarea class="jsbox-default-editor" wrap="off" placeholder="CMD+Return to execute, CMD+Backspace to reset">').appendTo($target);
                
                this.$ui.on('keydown', function(e) {
                    var keyCode = e.keyCode || e.which;

                    // handle tab to indent
                    if (keyCode == 9) {
                        e.preventDefault();
                        var start = $(this).get(0).selectionStart;
                        var end = $(this).get(0).selectionEnd;

                        // set textarea value to: text before caret + tab + text after caret
                        $(this).val($(this).val().substring(0, start)
                            + "  "
                            + $(this).val().substring(end));

                        // put caret at right position again
                        $(this).get(0).selectionStart = $(this).get(0).selectionEnd = start + 2;
                    }

                    // cmd+Enter to trigger execute
                    if (keyCode == 13 && e.ctrlKey || keyCode == 13 && e.metaKey) {
                        e.preventDefault();
                        e.stopPropagation();
                        publish(self, 'cmd-run');
                    }
                    
                    // cmd+Est to trigger reset
                    if (keyCode == 27 && e.ctrlKey || keyCode == 27 && e.metaKey) {
                        e.preventDefault();
                        e.stopPropagation();
                        publish(self, 'cmd-reset');
                    }
                    
                    // cmd+Backspace to trigger reset
                    if (keyCode == 8 && e.ctrlKey || keyCode == 8 && e.metaKey) {
                        e.preventDefault();
                        e.stopPropagation();
                        publish(self, 'cmd-reset');
                    }

                });
                
                this.$ui.on('keyup', function(e) {
                    clearTimeout(timer);
                    timer = setTimeout(function() {
                        updateFn(self.getSource());
                    }, delay);
                    
                });
                
                // auto resize textarea
                resizeTextArea(self.$ui);
                var t;
                this.$ui.on('keydown change', function(e) {
                    clearTimeout(t);
                    t = setTimeout(function() {
                        resizeTextArea(self.$ui);
                    }, 500);
                });

                this.setSource(source);
            },
            on: function(e, cb) {
                subscribe(this, e, cb);
            },
            dispose: function() {
                this.$ui.off().remove();
                this.$ui = null;
            },
            getSource: function() {
                return this.$ui.val();
            },
            // must not trigger the updateFn!
            setSource: function(source) {   
                this.$ui.val(source);
                return this;
            }
        };
        
        function resizeTextArea($el) {
            $el.css('height', 'auto');
            $el.css('height', ($el[0].scrollHeight + 15) + 'px');
//            $el.stop().animate({
//                'height': ($el[0].scrollHeight + 15) + 'px'
//            }, 200);
        }
        
        return editor;
    
    })();
    
    
    
    
    
    
    
    
    
    
    
    
    // --------------------------------------------------- //
    // ---[   D E F A U L T   T E S T   R U N N E R   ]--- //
    // --------------------------------------------------- //
    
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
    
    
    
    
    
    
    
    
    
    
    
    
    // --------------------------------------------------- //
    // ---[   J Q U E R Y   P L U G I N   S E T U P   ]--- //
    // --------------------------------------------------- //
    
    
    /**
     * Instance Initialization Method
     * each instance is being attached to the DOM Data of the target object
     * so it is accessible in every moment.
     */
    function init(config) {
        var $this = $(this);
        
        // prevent multiple initialisation
        if ($this.data('jsbox') && $this.data('jsbox') !== true) {
            return;
        }
        
        config = $.extend({}, config, {
            next: $this.attr('data-jsbox-next') || ''
        });
        
        var instance = Object.create(JSBox);
        instance.init(this, config);
        $this.data('jsbox', instance);
        
        // lock next exercise
        if (config.next) {
            var next;
            $(document).delegate(config.next, 'jsbox-ready', function(e, _next) {
                next = _next;
                next.disable();
            });
            instance.on('status', function(status) {
                if (status && next) {
                    next.enable();
                }
            });
        }
        
        $this.trigger('jsbox-ready', instance);
        
    }
    
    /**
     * Destroy and remove a JSBox instance from memory and DOM Data
     */
    function dispose() {
        var instance = $(this).data('jsbox');
        if (instance) {
            instance.dispose();
            instance = null;
            $.removeData(this, 'jsbox');
        }
    }
    
    /**
     * Global writable defaults
     */
    $.jsboxDefaults = {
        code: '',
        codeQuery: 'code',
        tests: [],
        testsQuery: 'ul>li',
        editor: null, // custom editor adapter
        sandbox: null, // custom text execution sandbox 
        updateDelay: 300
    };
    
    /**
     * jQuery Plugin
     */
    $.fn.jsbox = function() {
        
        var args = Array.prototype.slice.call(arguments);
        
        // simple setup
        if (!args.length) {
            $(this).each(init, [$.jsboxDefaults]);
            
        // config setup
        } else if ($.isPlainObject(args[0])) {
            var config = $.extend({}, $.jsboxDefaults, args[0]);
            $(this).each(init, [config]);
        
        // custom call with string params
        } else {
            switch (args[0]) {
                case 'instance':
                    return $(this).data('jsbox');
                case 'dispose':
                    $(this).each(dispose);
                    break;
                default:
                    throw 'JSBox does not support "' + args[0].toString() + '" API call';
            }
        }
        
        return this;
    };
    
    
    /**
     * Widgets auto setup
     */
    $(document).ready(function() {
        $('[data-jsbox]').jsbox();
    });
    
})(jQuery);
