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
var aceEditorEngine = {
    create: null
};

(function() {
    
    var AceEditorDefaults = {
        language: 'txt',
        source: '',
        sourceDelay: 0,
        autosizeDelay: 0
    };
    
    var AceEditor = {
        init: function(options) {
            var self = this;
            this.options = extend({}, AceEditorDefaults, options || {});
            this.el = dom.create('div', null, 'jsbox-ace jsbox-ace-' + this.options.language);
            
            this.ace = ace.edit(this.el);
            
            switch (this.options.language) {
                case 'html':
                    this.ace.getSession().setMode("ace/mode/html");
                    break;
                case 'css':
                    this.ace.getSession().setMode("ace/mode/css");
                    break;
                case 'js':
                    this.ace.getSession().setMode("ace/mode/javascript");
                    break;
            }
            
            if (this.options.theme) {
                this.ace.setTheme("ace/theme/" + this.options.theme);
            }
            
            this.ace.commands.addCommand({
                name: "executeShortcut",
                bindKey: {win: "Ctrl-Return", mac: "Command-Return"},
                exec: function(editor) {
                    publish(self, 'cmd-execute');
                }
            });
            
            this.ace.commands.addCommand({
                name: "resetShortcut",
                bindKey: {win: "Ctrl-Backspace", mac: "Command-Backspace"},
                exec: function(editor) {
                    publish(self, 'cmd-reset');
                }
            });
            
            this.setSource(this.options.source, true);
            
        },
        dispose: function() {
            this.ace.destroy();
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
            return this.ace.getSession().getValue();
        },
        setSource: function(source, loud) {
            this.ace.getSession().setValue(source);
            if (loud === true) {
                publish(this, 'source-update', source);
            }
        }
    };
    
    
    
    // Factory Method
    aceEditorEngine.create = function(options) {
        var instance = Object.create(AceEditor);
        instance.init(options);
        return instance;
    };

})();
