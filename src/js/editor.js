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
    }

    return editor;

})();