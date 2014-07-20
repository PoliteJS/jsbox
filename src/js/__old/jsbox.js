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