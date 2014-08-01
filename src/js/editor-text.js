/**
 * Simple Text Editor Adapter
 *
 * INTERFACE:
 * setSource()
 * getSource()
 *
 * EVENTS:
 * source-update
 * cmd-execute
 * cmd-reset
 */


/**
 * This is the external interface which is used by JSBox to create
 * a brand new instance. It's a factory method.
 */
var textEditorEngine = {
    create: null
};

(function() {
    
    var TextEditorDefaults = {
        language: 'txt',
        source: '',
        sourceDelay: 0,
        autosizeDelay: 0
    };
    
    var TextEditor = {
        init: function(options) {
            this.options = extend({}, TextEditorDefaults, options || {});
            this.el = dom.create('textarea', null, 'jsbox-texted jsbox-texted-' + this.options.language);
            this.el.setAttribute('placeholder', this.options.language);
            this.setSource(this.options.source, true);
            onKeyDown(this);
            onKeyUp(this);
        },
        dispose: function() {
            dom.clearEvents(this.el);
            dom.remove(this.el);
            this.el = null;
            disposePubSub(this);
        },
        reset: function() {
            this.setSource(this.options.source, true);
        },
        on: function(e, cb) {
            subscribe(this, e, cb);
        },
        getSource: function() {
            return this.el.value;
        },
        setSource: function(source, loud) {
            this.el.value = unescape(escape(source));
            checkAutoSize(this);
            if (loud === true) {
                publish(this, 'source-update', source);
            }
        }
    };
    
    function onKeyDown(editor) {
        var el = editor.el;
        dom.addEvent(el, 'keydown', function(e) {
            var keyCode = e.keyCode || e.which;

            // handle tab to indent
            if (keyCode == 9) {
                e.preventDefault();

                // set textarea value to: text before caret + tab + text after caret
                el.value = [    
                    el.value.substring(0, el.selectionStart),
                    el.value.substring(el.selectionEnd)
                ].join(' ');

                // put caret at right position again
                el.selectionStart = el.selectionEnd = el.selectionStart + 2;
            }

            // cmd+Enter to trigger execute
            if (keyCode == 13 && e.ctrlKey || keyCode == 13 && e.metaKey) {
                e.preventDefault();
                e.stopPropagation();
                publish(editor, 'cmd-execute');
            }

            // cmd+Backspace to trigger reset
            if (keyCode == 8 && e.ctrlKey || keyCode == 8 && e.metaKey) {
                e.preventDefault();
                e.stopPropagation();
                publish(editor, 'cmd-reset');
            }
        });
    }
    
    function onKeyUp(editor) {
        var el = editor.el;
        dom.addEvent(el, 'keyup', function() {
            clearTimeout(editor._timer);
            editor._timer = setTimeout(function() {
                publish(editor, 'source-update', editor.getSource());
                checkAutoSize(editor);
            }, editor.options.sourceDelay);
        });
    }
    
    function checkAutoSize(editor) {
        var el = editor.el;
        clearTimeout(editor._autosize);
        editor._autosize = setTimeout(function() {
            el.style.height = 'auto';
            el.style.height = (el.scrollHeight + 15) + 'px';
        }, editor.options.autosizeDelay);
    }
    
    
    
    
    // Factory Method
    textEditorEngine.create = function(options) {
        var instance = Object.create(TextEditor);
        instance.init(options);
        return instance;
    };

})();
