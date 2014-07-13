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
            
            this.test = '';
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
            this.sandbox.reset().run(this.source);
        }
    };
    
    function loadSourceCode(box) {
        if (!box.config.code && box.config.codeSrc) {
            box.source = box.$el.find(box.config.codeSrc).text();
        } else {
            box.source = box.config.code;
        }
        box._originalSource = box.source;
    };
    
    function loadTestCode(box) {
        if (!box.config.test && box.config.testSrc) {
            box.test = box.$el.find(box.config.testSrc).text();
        } else {
            box.test = box.config.test;
        }
        box._originalSource = box.source;
    };
    
    // DOM
    function initDOM(box) {
        box._originalHTML = box.$el.html();
        box.$el.empty();
        
        box.$editor = $('<div class="jsbox-editor">');
        box.$console = $('<div class="jsbox-console">');
        box.$test = $('<pre class="jsbox-test">').text(box.test);
        box.$sandbox = $('<iframe class="jsbox-sandbox">').hide();
        box.$runBtn = $('<button>').text('run');
        box.$resetBtn = $('<button>').text('reset');
        
        box.$runBtn.on('click', box.run.bind(box));
        box.$resetBtn.on('click', box.reset.bind(box));
        
        box.$el
            .append(box.$editor)
            .append(box.$console)
            .append(box.$test)
            .append(box.$sandbox)
            .append(box.$runBtn)
            .append(box.$resetBtn);
    }
    
    function disposeDOM(box) {
        box.$editor.remove();
        box.$console.remove();
        box.$test.remove();
        box.$sandbox.remove();
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
        box.sandbox.init(box.$sandbox[0], box.test);
        
        box.sandbox.on('success', function() {
            box.$test.addClass('success');
        });
        box.sandbox.on('failure', function() {
            box.$test.addClass('failure');
        });
        box.sandbox.on('reset', function() {
            box.$test.removeClass('success').removeClass('failure');
        });
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
            init: function(el, test) {
                this.el = el;
                this.test = test;
                this._subs = {
                    success: [],
                    failure: [],
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
            run: function(source) {
                
                var self = this;
                
                execute(this.el, source, this.test, function(result) {
                    trigger(self, result ? 'success' : 'failure');
                });
                
            }
        };
        
        function trigger() {
            var args = Array.prototype.slice.call(arguments);
            var runner = args.shift();
            var event = args.shift();
            runner._subs[event].forEach(function(cb) {
                cb.apply(null, args);
            });
        }
        
        function execute(box, source, test, callback) {
            var async = false;
            var scope = box.contentWindow;
            var body = scope.document.body;
            
            body.innerHTML = '';
            
            function test() {
                scope.sandboxTestResultsHandler = callback.bind(scope);
                makeScriptEl('sandboxTestResultsHandler(' + test + ')', body);
            }
            
            scope.async = function() {
                async = true;
                return test;
            };
            
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
    
    
    
    
    
    
    
    
    
    // --------------------------------------------------- //
    // ---[   J Q U E R Y   P L U G I N   S E T U P   ]--- //
    // --------------------------------------------------- //
    
    
    /**
     * Instance Initialization Method
     * each instance is being attached to the DOM Data of the target object
     * so it is accessible in every moment.
     */
    function init(config) {
        var instance = Object.create(JSBox);
        instance.init(this, config);
        $(this).data('jsbox', instance);
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
        codeSrc: 'pre:first',
        test: '',
        testSrc: 'pre:last',
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
    
})(jQuery);
