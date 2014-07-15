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
        setSource: function(source) {
            this.source = source;
            this.editor.setSource(this.source);
        },
        reset: function() {
            this.sandbox.reset();
            this.setSource(this._originalSource);
        },
        run: function() {
            this.sandbox.reset().run(this.source, this.tests);
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
        box.$el.empty();
        
        box.$editor = $('<div class="jsbox-editor">');
        box.$console = $('<div class="jsbox-console">');
        
        box.$tests = $('<ul class="jsbox-test">');
        box.tests.forEach(function(test) {
            box.$tests.append($('<li>').text(test));
        });
        
        box.$sandbox = $('<div class="jsbox-sandbox">');
        box.$exception = $('<div class="jsbox-exception">');
        
        box.$runBtn = $('<button>').text('run');
        box.$resetBtn = $('<button>').text('reset');
        
        box.$runBtn.on('click', box.run.bind(box));
        box.$resetBtn.on('click', box.reset.bind(box));
        
        box.$el
            .append(box.$editor)
            .append(box.$console)
            .append(box.$tests)
            .append(box.$sandbox)
            .append(box.$exception)
            .append(box.$runBtn)
            .append(box.$resetBtn);
    }
    
    function disposeDOM(box) {
        box.$editor.remove();
        box.$console.remove();
        box.$tests.remove();
        box.$sandbox.remove();
        box.$exception.remove();
        box.$runBtn.off().remove();
        box.$resetBtn.off().remove();
        box.$el.html(box._originalHTML);
    }
    
    // EDITOR
    function initEditor(box) {
        var editor = box.config.editor || defaultEditor;
        box.editor = Object.create(editor);
        box.editor.init(box.$editor, box.setSource.bind(box), box.source, box.config.updateDelay);
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
        
        box.sandbox.on('success', function(index) {
            box.$tests.find(':eq(' + index + ')').addClass('success');
        });
        box.sandbox.on('failure', function(index) {
            box.$tests.find(':eq(' + index + ')').addClass('failure');
        });
        box.sandbox.on('reset', function() {
            box.$exception.html('').hide();
            box.$tests.find('.success').removeClass('success');
            box.$tests.find('.failure').removeClass('failure');
        });
        box.sandbox.on('exception', function(e) {
            box.$exception.html(e.message).show();
        });
        
        box.sandbox.reset();
    }
    
    function disposeSandbox(box) {
        box.sandbox.dispose();
        box.sandbox = null;
    }
    
    
    
    
    // --------------------------------------------------------- //
    // ---[   D E F A U L T   E D I T O R   A D A P T E R   ]--- //
    // --------------------------------------------------------- //
    
    /*
     * implements a simple textarea wich trigger an update callback
     * with the current code.
     */
    
    var defaultEditor = {
        init: function($target, updateFn, source, delay) {
            var self = this;
            var timer;
            var delay = delay || 250;
            
            this.$ui = $('<textarea class="jsbox-default-editor">').on('keyup', function(e) {
                clearTimeout(timer);
                timer = setTimeout(function() {
                    updateFn(self.getSource());
                }, delay);
            }).appendTo($target);
            
            this.setSource(source);
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
    
    
    
    
    // --------------------------------------------------- //
    // ---[   D E F A U L T   T E S T   R U N N E R   ]--- //
    // --------------------------------------------------- //
    
    var defaultSandbox = (function() {
        
        var sandbox = {
            init: function(el) {
                this.el = el;
                this._subs = {
                    success: [],
                    failure: [],
                    exception: [],
                    reset: []
                };
            },
            dispose: function() {},
            on: function(evt, cb) {
                this._subs[evt].push(cb);
            },
            reset: function() {
                trigger(this, 'reset');
                return this;
            },
            run: function(source, tests) {
                var self = this;
                var publishEvent = function() {
                    var args = Array.prototype.slice.call(arguments);
                    args.unshift(self);
                    trigger.apply(null, args);
                };
                execute(this.el, source, tests, publishEvent, function(test, index, result) {
                    trigger(self, result ? 'success' : 'failure', index, test);
                });
            }
        };
        
        function trigger(runner, event) {
            var args = Array.prototype.slice.call(arguments);
            args.shift();
            args.shift();
            runner._subs[event].forEach(function(cb) {
                cb.apply(null, args);
            });
        }
        
        function execute(sandbox, source, tests, publishEvent, callback) {
            // one shot iframe where to run the code and tests
            var box = document.createElement('iframe');
            sandbox.appendChild(box);
            
            var async = false;
            var scope = box.contentWindow;
            var body = scope.document.body;
            
            scope.sandboxCatchErrors = function(e) {
                publishEvent('exception', e);
            };
            
            function test() {
                tests.forEach(function(test, index) {
                    scope.sandboxTestResultsHandler = function(result) {
                        callback.call(scope, test, index, result);
                    };
                    makeScriptEl('try {sandboxTestResultsHandler(' + test + ');} catch (e) {sandboxTestResultsHandler(false);}', body);
                });
                sandbox.removeChild(box);
            }
            
            scope.async = function() {
                async = true;
                return test;
            };
            
            var source = 'try {' + source + '} catch(e) { sandboxCatchErrors(e); }';
            
            makeScriptEl(source, body);
            
            if (async) {
                return;
            }
            
            test();
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
        
        return sandbox;
        
    })();
    
    
    
    
    
    
    
    
    
    
    
    // --------------------------------------------------------- //
    // ---[   D E F A U L T   C O N S O L E   L O G G E R   ]--- //
    // --------------------------------------------------------- //
    
    var defaultConsole = (function() {
        
        var console = {};
        
        
        return console;
    
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
        if ($this.data('jsbox')) {
            return;
        }
        var instance = Object.create(JSBox);
        instance.init(this, config);
        $this.data('jsbox', instance);
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
        console: null, // custom console logger
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
    
})(jQuery);
