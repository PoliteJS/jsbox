/* JSBox v3.1.1 | by Marco Pegoraro | http://politejs.com/jsbox */


(function() {
    /**
 * DOM Utility Abstraction Layer
 * 
 */
var extend = jQuery.extend;

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

function disposePubSub(obj) {
    if (!obj._subscriptions) {
        return;
    }
    obj._subscriptions = null;
}

/**
 * DOM Utility Abstraction Layer
 * 
 */
var dom = function($) {
    return {
        create: function(tag, _id, _class, _html) {
            var $el = $("<" + tag + ">");
            if (_id) {
                $el.attr("id", _id);
            }
            if (_class) {
                $el.addClass(_class);
            }
            if (_html) {
                $el.append(_html);
            }
            return $el[0];
        },
        append: function(el, target) {
            $(target).append(el);
        },
        remove: function(el) {
            $(el).remove();
        },
        empty: function(el) {
            $(el).empty();
        },
        addClass: function(el, className) {
            $(el).addClass(className);
        },
        removeClass: function(el, className) {
            $(el).removeClass(className);
        },
        addEvent: function(el, name, handler) {
            $(el).on(name, handler);
        },
        clearEvents: function(el) {
            $(el).off();
        }
    };
}(jQuery);

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
        language: "txt",
        source: "",
        sourceDelay: 0,
        autosizeDelay: 0
    };
    var TextEditor = {
        init: function(options) {
            this.options = extend({}, TextEditorDefaults, options || {});
            this.el = dom.create("textarea", null, "jsbox-texted jsbox-texted-" + this.options.language);
            this.el.setAttribute("placeholder", this.options.language);
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
                publish(this, "source-update", source);
            }
        }
    };
    function onKeyDown(editor) {
        var el = editor.el;
        dom.addEvent(el, "keydown", function(e) {
            var keyCode = e.keyCode || e.which;
            // handle tab to indent
            if (keyCode == 9) {
                e.preventDefault();
                // set textarea value to: text before caret + tab + text after caret
                el.value = [ el.value.substring(0, el.selectionStart), el.value.substring(el.selectionEnd) ].join(" ");
                // put caret at right position again
                el.selectionStart = el.selectionEnd = el.selectionStart + 2;
            }
            // cmd+Enter to trigger execute
            if (keyCode == 13 && e.ctrlKey || keyCode == 13 && e.metaKey) {
                e.preventDefault();
                e.stopPropagation();
                publish(editor, "cmd-execute");
            }
            // cmd+Backspace to trigger reset
            if (keyCode == 8 && e.ctrlKey || keyCode == 8 && e.metaKey) {
                e.preventDefault();
                e.stopPropagation();
                publish(editor, "cmd-reset");
            }
        });
    }
    function onKeyUp(editor) {
        var el = editor.el;
        dom.addEvent(el, "keyup", function() {
            clearTimeout(editor._timer);
            editor._timer = setTimeout(function() {
                publish(editor, "source-update", editor.getSource());
                checkAutoSize(editor);
            }, editor.options.sourceDelay);
        });
    }
    function checkAutoSize(editor) {
        var el = editor.el;
        clearTimeout(editor._autosize);
        editor._autosize = setTimeout(function() {
            el.style.height = "auto";
            el.style.height = el.scrollHeight + 15 + "px";
        }, editor.options.autosizeDelay);
    }
    // Factory Method
    textEditorEngine.create = function(options) {
        var instance = Object.create(TextEditor);
        instance.init(options);
        return instance;
    };
})();

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
        language: "txt",
        source: "",
        sourceDelay: 0,
        autosizeDelay: 0
    };
    var AceEditor = {
        init: function(options) {
            var self = this;
            this.options = extend({}, AceEditorDefaults, options || {});
            this.el = dom.create("div", null, "jsbox-ace jsbox-ace-" + this.options.language);
            this.ace = ace.edit(this.el);
            switch (this.options.language) {
              case "html":
                this.ace.getSession().setMode("ace/mode/html");
                break;

              case "css":
                this.ace.getSession().setMode("ace/mode/css");
                break;

              case "js":
                this.ace.getSession().setMode("ace/mode/javascript");
                break;
            }
            if (this.options.theme) {
                this.ace.setTheme("ace/theme/" + this.options.theme);
            }
            this.ace.commands.addCommand({
                name: "executeShortcut",
                bindKey: {
                    win: "Ctrl-Return",
                    mac: "Command-Return"
                },
                exec: function(editor) {
                    publish(self, "cmd-execute");
                }
            });
            this.ace.commands.addCommand({
                name: "resetShortcut",
                bindKey: {
                    win: "Ctrl-Backspace",
                    mac: "Command-Backspace"
                },
                exec: function(editor) {
                    publish(self, "cmd-reset");
                }
            });
            this.ace.on("focus", function() {
                publish(self, "focus");
            });
            this.ace.on("blur", function() {
                publish(self, "blur");
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
                publish(this, "source-update", source);
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
        timeout: 1e4,
        artifax: [],
        scripts: [],
        styles: []
    };
    var Sandbox = {
        init: function(options) {
            this.options = extend({}, SandboxDefaults, options || {});
            this.el = dom.create("div", null, "jsbox-sandbox");
            if (options.visible === false) {
                dom.addClass(this.el, "jsbox-sandbox-hidden");
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
                publish(this, "reset");
            }
        }
    };
    function execute(box, source, tests) {
        var scope = box.iframe.contentWindow;
        var async = false;
        publish(box, "start", scope);
        source = extend({
            js: "",
            css: "",
            html: ""
        }, source);
        fakeConsole(box, scope);
        scope.sandboxSourceErrors = function(e) {
            publish(box, "exception", e);
        };
        scope.jsboxTest = function() {
            test(box, scope, tests);
        };
        scope.jsboxSyncEnd = function() {
            // auto detect async code
            if (!async && source.js.indexOf("jsboxTest()") !== -1) {
                async = true;
            }
            if (!async) {
                scope.jsboxTest();
            }
        };
        scope.jsboxAsync = function() {
            async = true;
            return scope.jsboxTest;
        };
        // create external CSS libraries list
        var styles = "";
        box.options.styles.forEach(function(style) {
            styles += '<link rel="stylesheet" href="' + styleLibraryUrl(style) + '"></script>';
        });
        // create external Javascript libraries list
        var scripts = "";
        box.options.scripts.forEach(function(script) {
            scripts += '<script src="' + scriptLibraryUrl(script) + '"></script>';
        });
        // create the list of artifax
        var artifax = "";
        box.options.artifax.forEach(function(code) {
            artifax += "<script>try {" + code + "\n} catch(e) {}</script>";
        });
        // provide access to the user generated code for static analysis pourposes
        scope.jsbox = {
            source: {
                js: source.js,
                css: source.css,
                html: source.html
            }
        };
        scope.document.open();
        scope.document.write([ "<html><head>", styles, "<style>" + source.css + "\n</style>", scripts, artifax, "</head><body>", source.html + "\n", "<script>", "try {" + source.js + "\n} catch(e) {sandboxSourceErrors(e)};", "jsboxSyncEnd();", "</script></body></html>" ].join(""));
        scope.document.close();
    }
    /**
     * fullResult starts to be "null" because jsboxes with no tests
     * shouldn't have any outcome class.
     */
    function test(sandbox, scope, tests) {
        var fullResult = null;
        tests.forEach(function(test, index) {
            scope.sandboxTestResultsHandler = function(partialResult) {
                publish(sandbox, "test-result", test, partialResult, index, scope);
                if (fullResult === null) {
                    fullResult = partialResult;
                } else {
                    fullResult = fullResult && partialResult;
                }
            };
            var script = document.createElement("script");
            script.appendChild(document.createTextNode("try {sandboxTestResultsHandler(" + test + ")} catch (e) {sandboxTestResultsHandler(false)}"));
            scope.document.body.appendChild(script);
        });
        publish(sandbox, "finish", scope, fullResult);
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
        var version = "";
        if (name.indexOf("//") !== -1 || name.indexOf(".js") !== -1) {
            return name;
        }
        if (name.indexOf("@") !== -1) {
            var tokens = name.split("@");
            var version = tokens[1];
            name = tokens[0];
        }
        switch (name) {
          case "sinonjs":
          case "sinon":
            version = version || "1.7.3";
            name = "//cdnjs.cloudflare.com/ajax/libs/sinon.js/@@@/sinon-min.js";
            break;

          case "jquery":
          case "jq":
          case "$":
            version = version || "2.1.1";
            name = "//cdnjs.cloudflare.com/ajax/libs/jquery/@@@/jquery.min.js";
            break;

          case "underscore":
          case "_":
            version = version || "1.6.0";
            name = "//cdnjs.cloudflare.com/ajax/libs/underscore.js/@@@/underscore-min.js";
            break;

          case "knockoutjs":
          case "knockout":
          case "ko":
            version = version || "3.1.0";
            name = "//cdnjs.cloudflare.com/ajax/libs/knockout/@@@/knockout-min.js";
            break;

          case "backbonejs":
          case "backbone":
            version = version || "1.1.2";
            name = "//cdnjs.cloudflare.com/ajax/libs/backbone.js/@@@/backbone-min.js";
            break;

          case "mochajs":
          case "mocha":
            version = version || "1.20.1";
            name = "//cdnjs.cloudflare.com/ajax/libs/mocha/@@@/mocha.js";
            break;

          case "chaijs":
          case "chai":
            version = version || "1.9.1";
            name = "//cdnjs.cloudflare.com/ajax/libs/chai/@@@/chai.min.js";
            break;
        }
        return name.replace("@@@", version);
    }
    function styleLibraryUrl(name) {
        return name;
    }
    function createIframe(sandbox) {
        sandbox.iframe = dom.create("iframe", null, "jsbox-sandbox-runner");
        dom.append(sandbox.iframe, sandbox.el);
    }
    function removeIframe(sandbox) {
        if (sandbox.iframe) {
            dom.remove(sandbox.iframe);
            sandbox.iframe = null;
        }
    }
    // ------------------------------------- //
    // ---[   F A K E   C O N S O L E   ]--- //
    // ------------------------------------- //
    function fakeConsole(sandbox, scope) {
        scope.console = {};
        [ "log", "warn", "error" ].forEach(function(type) {
            scope.console[type] = function() {
                var args = Array.prototype.slice.call(arguments);
                publish(sandbox, type, consoleLogArgs(args), args);
            };
        });
        scope.console["assert"] = function(assertion, msg) {
            if (assertion === true) {
                publish(sandbox, "assertion-passed", msg);
            } else {
                publish(sandbox, "assertion-failed", msg);
            }
        };
    }
    function consoleLogArgs(args) {
        return args.map(consoleLogArg).join(", ");
    }
    function consoleLogArg(item) {
        switch (typeof item) {
          case "string":
            return '"' + item + '"';

          case "object":
            if (Object.prototype.toString.call(item) === "[object Date]") {
                return item.toString();
            } else if (Array.isArray(item)) {
                return "[" + item.map(consoleLogArg).join(", ") + "]";
            } else {
                return "{" + Object.keys(item).map(function(key) {
                    return key + ":" + consoleLogArg(item[key]);
                }).join(", ") + "}";
            }

          case "function":
            return item.toString();

          case "boolean":
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

/**
 * Simple Logger Engine
 * ======================
 *
 * display a list of log messages
 *
 * INTERFACE:
 * render()
 * dispose()
 *
 */
/**
 * This is the external interface which is used by JSBox to create
 * a brand new instance. It's a factory method.
 */
var loggerEngine = {
    create: null
};

(function() {
    var LoggerEngine = {
        init: function() {
            this.el = dom.create("ul", null, "jsbox-logger");
            this.logs = [];
        },
        dispose: function() {
            this.reset();
            dom.remove(this.el);
        },
        push: function(type, message) {
            var logEl = dom.create("li", null, "jsbox-logger-item jsbox-logger-item-" + type, message);
            dom.append(logEl, this.el);
        },
        reset: function() {
            dom.empty(this.el);
        }
    };
    // Factory Method
    loggerEngine.create = function() {
        var instance = Object.create(LoggerEngine);
        instance.init();
        return instance;
    };
})();

/**
 * Simple Logger Engine
 * ======================
 *
 * display a list of log messages
 *
 * INTERFACE:
 * render()
 * dispose()
 *
 */
/**
 * This is the external interface which is used by JSBox to create
 * a brand new instance. It's a factory method.
 */
var testsListEngine = {
    create: null
};

(function() {
    var TestsListEngine = {
        init: function(tests) {
            this.el = dom.create("ul", null, "jsbox-tests-list");
            this.tests = [];
            this.reset();
            tests.forEach(this.push.bind(this));
        },
        dispose: function() {
            dom.remove(this.el);
        },
        push: function(test) {
            var testEl = dom.create("li", null, "jsbox-tests-list-item", test.label || test.code);
            dom.append(testEl, this.el);
            dom.removeClass(this.el, "jsbox-tests-list-empty");
            this.tests.push({
                code: test.code,
                el: testEl
            });
        },
        getList: function() {
            return this.tests.map(function(item) {
                return item.code;
            });
        },
        reset: function() {
            if (this.tests.length === 0) {
                dom.addClass(this.el, "jsbox-tests-list-empty");
            } else {
                dom.removeClass(this.el, "jsbox-tests-list-empty");
            }
            this.tests.forEach(function(item) {
                dom.removeClass(item.el, "jsbox-tests-list-item-ok");
                dom.removeClass(item.el, "jsbox-tests-list-item-ko");
            });
        },
        setStatus: function(test, status) {
            this.tests.filter(function(item) {
                return item.code === test;
            }).forEach(function(item) {
                if (status) {
                    dom.addClass(item.el, "jsbox-tests-list-item-ok");
                } else {
                    dom.addClass(item.el, "jsbox-tests-list-item-ko");
                }
            });
        }
    };
    // Factory Method
    testsListEngine.create = function(tests) {
        var instance = Object.create(TestsListEngine);
        instance.init(tests || []);
        return instance;
    };
})();

/**
 * Simple Template Engine
 * ======================
 *
 * this component is responsible to dispose available JSBox 
 * elements within the DOM Wrapper.
 *
 * template:simple -    all available elements are just listed one
 *                      after one.
 *
 * template:advanced -  a tab panel structure is provided and
 *                      some js events are added to enable tab switching
 *                      mechanism
 *
 * INTERFACE:
 * render()
 * dispose()
 *
 */
/**
 * This is the external interface which is used by JSBox to create
 * a brand new instance. It's a factory method.
 */
var templateEngine = {
    create: null
};

(function() {
    var TemplateEngine = {
        init: function(box) {
            this.el = box.el;
            this.box = box;
            this.options = box.options.template || {};
            if (typeof this.options === "string") {
                this.options = {
                    name: this.options
                };
            }
            this.options = extend({
                name: "simple"
            }, this.options);
            switch (this.options.name) {
              case "simple":
                renderSimple(this.el, this.options, this.box);
                break;

              case "advanced":
                dom.append("-- JSBox Advance Template yet to be implemented--", this.box.el);
                break;

              default:
                dom.append("-- JSBox unknown template--", this.box.el);
            }
            initEvents(this.box);
        },
        dispose: function() {
            dom.empty(this.el);
        }
    };
    function renderSimple(target, options, box) {
        target.classList.add("jsbox-tpl-simple");
        [ "testsList" ].forEach(function(key) {
            var wrapper = dom.create("div", null, "jsbox-tpl-wrapper jsbox-tpl-wrapper-" + key);
            dom.append(box[key].el, wrapper);
            dom.append(wrapper, target);
        });
        // editors
        var editors = dom.create("div", null, "jsbox-tpl-wrapper-editors");
        for (var key in box.editors) {
            var wrapper = dom.create("div", null, "jsbox-tpl-wrapper jsbox-tpl-wrapper-" + key);
            dom.append(box.editors[key].el, wrapper);
            dom.append(wrapper, editors);
        }
        dom.append(editors, target);
        // components
        [ "logger", "sandbox" ].forEach(function(key) {
            var wrapper = dom.create("div", null, "jsbox-tpl-wrapper jsbox-tpl-wrapper-" + key);
            dom.append(box[key].el, wrapper);
            dom.append(wrapper, target);
        });
        // buttons
        var buttons = dom.create("div", null, "jsbox-tpl-wrapper-buttons");
        var execBtn = dom.create("button", null, "jsbox-cmd jsbox-cmd-execute", "Run &raquo;");
        var resetBtn = dom.create("button", null, "jsbox-cmd jsbox-cmd-reset", "Reset");
        dom.addEvent(execBtn, "click", box.execute.bind(box));
        dom.addEvent(resetBtn, "click", box.reset.bind(box));
        dom.append(resetBtn, buttons);
        dom.append(execBtn, buttons);
        dom.append(buttons, target);
        // overlay
        var overlay = dom.create("div", null, "jsbox-tpl-overlay", "<p>" + box.options.disabledMsg + "</p>");
        dom.append(overlay, target);
    }
    /**
     * Exposes JSBOX status through DOM classes 
     */
    function initEvents(box) {
        var _activeTimer = null;
        dom.addEvent(box.el, "click", function() {
            if (box.isEnabled()) {
                if (!box.isActive()) {
                    box.setActive(true);
                    dom.removeClass(box.el, "jsbox-failed");
                }
            }
        });
        box.on("enabled-status-changed", function(status) {
            if (status) {
                dom.addClass(box.el, "jsbox-enabled");
                dom.removeClass(box.el, "jsbox-disabled");
            } else {
                dom.removeClass(box.el, "jsbox-enabled");
                dom.addClass(box.el, "jsbox-disabled");
            }
        });
        box.on("active-status-changed", function(status) {
            if (status) {
                dom.addClass(box.el, "jsbox-active");
            } else {
                dom.removeClass(box.el, "jsbox-active");
            }
        });
        box.sandbox.on("reset", function(scope) {
            dom.removeClass(box.el, "jsbox-success");
            dom.removeClass(box.el, "jsbox-failed");
        });
        box.sandbox.on("start", function(scope) {
            dom.removeClass(box.el, "jsbox-success");
            dom.removeClass(box.el, "jsbox-failed");
            dom.addClass(box.el, "jsbox-running");
        });
        box.sandbox.on("finish", function(scope, result) {
            dom.removeClass(box.el, "jsbox-running");
            if (result === true) {
                dom.addClass(box.el, "jsbox-success");
            }
            if (result === false) {
                dom.addClass(box.el, "jsbox-failed");
            }
            // remove failure classes for an active box
            if (box.isActive()) {
                clearTimeout(box.template._checkActiveTimer);
                box.template._checkActiveTimer = setTimeout(function() {
                    dom.removeClass(box.el, "jsbox-failed");
                }, 3e3);
            }
        });
    }
    // Factory Method
    templateEngine.create = function(target, source) {
        var instance = Object.create(TemplateEngine);
        instance.init(target, source);
        return instance;
    };
})();

/**
 * JSBox
 */
var JSBoxDefaults = {
    disabled: false,
    disabledMsg: "please complete the previous exercise!",
    autorun: false,
    // editors
    editors: {
        html: false,
        css: false,
        js: ""
    },
    // tests list
    tests: [],
    sandbox: {
        visible: false
    },
    // adapter injection
    engines: {
        editor: window.ace ? aceEditorEngine : textEditorEngine,
        sandbox: sandboxEngine,
        logger: loggerEngine,
        testsList: testsListEngine,
        template: templateEngine
    }
};

var JSBox = {
    init: function(options) {
        this.options = extend({}, JSBoxDefaults, options || {});
        this.editors = {};
        initSandbox(this);
        initEditors(this);
        initLogger(this);
        initTestsList(this);
        initDOM(this);
        // status flags
        this.__enabled = false;
        this.__active = false;
        if (this.options.disabled === true) {
            this.setEnabled(false);
        } else {
            this.setEnabled(true);
        }
        if (this.options.autorun === true) {
            setTimeout(this.execute.bind(this), 0);
        }
    },
    dispose: function() {
        publish(this, "dispose");
        disposeSandbox(this);
        disposeEditors(this);
        disposeLogger(this);
        disposeTestsList(this);
        disposeDOM(this);
        disposePubSub(this);
    },
    on: function(event, handler) {
        subscribe(this, event, handler);
    },
    getEl: function() {
        return this.el;
    },
    setEnabled: function(status) {
        var self = this;
        var oldValue = this.__enabled;
        this.__enabled = status === true ? true : false;
        clearTimeout(this._setEnabledTimer);
        this._setEnabledTimer = setTimeout(function() {
            if (oldValue !== self.active) {
                publish(self, "enabled-status-changed", self.__enabled, oldValue);
            }
        }, 50);
    },
    setActive: function(status) {
        var self = this;
        var oldValue = this.__active;
        this.__active = status === true ? true : false;
        clearTimeout(this._setActiveTimer);
        this._setActiveTimer = setTimeout(function() {
            if (oldValue !== self.active) {
                publish(self, "active-status-changed", self.__active, oldValue);
            }
        }, 50);
    },
    reset: function() {
        dom.removeClass(this.el, "jsbox-running");
        this.setActive(true);
        this.softReset();
        resetEditors(this);
        publish(this, "reset");
    },
    softReset: function() {
        this.testsList.reset();
        this.logger.reset();
        this.sandbox.reset();
    },
    execute: function() {
        this.setActive(true);
        this.softReset();
        this.sandbox.execute(boxSources(this), this.testsList.getList());
    },
    isActive: function() {
        return this.__active;
    },
    isEnabled: function() {
        return this.__enabled;
    }
};

function boxSources(box) {
    var sources = {};
    Object.keys(box.editors).forEach(function(editorName) {
        sources[editorName] = box.editors[editorName].getSource();
    });
    return sources;
}

// ------------------------------------- //
// ---[   I N I T   S A N D B O X   ]--- //
// ------------------------------------- //
function initSandbox(box) {
    box.sandbox = box.options.engines.sandbox.create(box.options.sandbox);
    box.sandbox.on("finish", function(scope, result) {
        if (result === true) {
            setTimeout(function() {
                publish(box, "success", box);
            }, 0);
        }
        if (result === false) {
            setTimeout(function() {
                publish(box, "error", box);
            }, 0);
        }
        setTimeout(function() {
            publish(box, "status", box, result, scope);
        }, 0);
    });
}

function disposeSandbox(box) {
    box.sandbox.dispose();
}

// ------------------------------------- //
// ---[   I N I T   E D I T O R S   ]--- //
// ------------------------------------- //
function initEditors(box) {
    Object.keys(box.options.editors).forEach(function(editorName) {
        if (box.options.editors[editorName] === false) {
            return;
        }
        var source = "";
        if (typeof box.options.editors[editorName] === "string") {
            source = box.options.editors[editorName];
        }
        box.editors[editorName] = box.options.engines.editor.create({
            language: editorName,
            source: source
        });
        box.editors[editorName].on("cmd-execute", box.execute.bind(box));
        box.editors[editorName].on("cmd-reset", box.reset.bind(box));
    });
}

function disposeEditors(box) {
    Object.keys(box.editors).forEach(function(editorName) {
        box.editors[editorName].dispose();
    });
    box.editors = null;
}

function resetEditors(box) {
    Object.keys(box.editors).forEach(function(editorName) {
        box.editors[editorName].reset();
    });
}

// ----------------------------------- //
// ---[   I N I T   L O G G E R   ]--- //
// ----------------------------------- //
function initLogger(box) {
    box.logger = box.options.engines.logger.create();
    [ "log", "warn", "error", "assertion-passed", "assertion-failed" ].forEach(function(type) {
        box.sandbox.on(type, function(message) {
            box.logger.push(type, message);
        });
    });
    box.sandbox.on("exception", function(e) {
        box.logger.push("exception", e.message);
    });
}

function disposeLogger(box) {
    box.logger.dispose();
}

// ------------------------------------------- //
// ---[   I N I T   T E S T S   L I S T   ]--- //
// ------------------------------------------- //
function initTestsList(box) {
    box.testsList = box.options.engines.testsList.create(box.options.tests);
    box.sandbox.on("test-result", function(test, result) {
        box.testsList.setStatus(test, result);
    });
}

function disposeTestsList(box) {
    box.testsList.dispose();
}

// ----------------------------- //
// ---[   I N I T   D O M   ]--- //
// ----------------------------- //
function initDOM(box) {
    box.el = dom.create("div", "", "jsbox");
    box.template = box.options.engines.template.create(box);
}

function disposeDOM(box) {
    box.template.dispose();
    dom.remove(box.el);
}

/**
 * INSTANCES REPOSITORY
 */
var jsboxes = [];

/**
 * FACTORY METHOD
 */
function createJsbox(options) {
    var instance = Object.create(JSBox);
    instance.init(options);
    jsboxes.push(instance);
    // deactivate every "other" active box
    instance.on("active-status-changed", function(status) {
        if (!status) {
            return;
        }
        jsboxes.filter(function(box) {
            return box !== instance;
        }).forEach(function(box) {
            box.setActive(false);
        });
    });
    // remove the box from the repository
    instance.on("dispose", function(box) {
        var index = jsboxes.indexOf(instance);
        if (index !== -1) {
            jsboxes.splice(index, 1);
        }
    });
    return instance;
}

/**
 * JSBox jQuery Plugin
 * ===================
 *
 * It is responsible to fetch DOM data from the page and create JSBox instances.
 */
// jQuery Wrapper
(function($) {
    /**
     * Global writable defaults
     */
    $.jsboxDefaults = {};
    /**
     * jQuery Plugin
     */
    $.fn.jsbox = function() {
        var $this = $(this);
        var args = Array.prototype.slice.call(arguments);
        // simple setup
        if (!args.length) {
            $this.each(init, [ $.jsboxDefaults ]);
        } else if ($.isPlainObject(args[0])) {
            var config = $.extend({}, $.jsboxDefaults, args[0]);
            $this.each(init, [ config ]);
        } else {
            switch (args[0]) {
              case "instance":
                return $this.data("jsbox");

              case "dispose":
                $this.each(dispose);
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
        $("[data-jsbox]").jsbox();
    });
    function buildConfig($el) {
        var $html, $css, $js, $code, $tests;
        var config = {
            editors: {
                html: false,
                css: false,
                js: ""
            },
            sandbox: {
                visible: false,
                libs: []
            },
            tests: []
        };
        $js = $el.find("[data-js]");
        if ($js.length) {
            config.editors.js = $js.html();
        }
        $css = $el.find("[data-css]");
        if ($css.length) {
            config.editors.css = $css.html();
            config.sandbox.visible = true;
        }
        $html = $el.find("[data-html]");
        if ($html.length) {
            config.editors.html = $html.html();
            config.sandbox.visible = true;
        }
        $artifax = $el.find("[data-artifax]");
        if ($artifax.length) {
            if ($artifax.children().length) {
                config.sandbox.artifax = [];
                $artifax.children().each(function() {
                    config.sandbox.artifax.push($(this).html());
                });
            } else {
                config.sandbox.artifax = [ $artifax.html() ];
            }
        }
        // js source fallback to the first "code" tag
        $code = $el.find("code").filter(function() {
            var $this = $(this);
            if ($this.attr("data-html") !== undefined || $this.attr("data-css") !== undefined || $this.attr("data-js") !== undefined || $this.attr("data-artifax") !== undefined) {
                return false;
            }
            return true;
        });
        if (!$js.length && $code.length) {
            config.editors.js = $code.html();
        }
        if ($el.attr("data-jsbox-scripts")) {
            config.sandbox.scripts = $el.attr("data-jsbox-scripts").split(",");
        }
        if ($el.attr("data-jsbox-styles")) {
            config.sandbox.styles = $el.attr("data-jsbox-styles").split(",");
        }
        // tests
        $el.find("[data-test]").each(function() {
            if ($(this).attr("data-test").length) {
                config.tests.push({
                    code: $(this).attr("data-test"),
                    label: $(this).html()
                });
            } else {
                config.tests.push({
                    code: $(this).html(),
                    label: ""
                });
            }
        });
        // chained boxes support
        if ($el.is("[data-jsbox-lock]")) {
            config.next = $el.attr("data-jsbox-next", "next");
        }
        if ($el.attr("data-jsbox-next")) {
            config.next = $el.attr("data-jsbox-next");
        }
        // autorun support
        if ($el.is("[data-jsbox-autorun]")) {
            config.autorun = true;
        }
        // [UNSTABLE] autorun disabled message support
        if ($el.is("[data-jsbox-disabled]")) {
            config.disabled = true;
            if ($el.attr("data-jsbox-disabled")) {
                config.disabledMsg = $el.attr("data-jsbox-disabled");
            }
        }
        //        console.log(config);
        return config;
    }
    /**
     * Instance Initialization Method
     * each instance is being attached to the DOM Data of the target object
     * so it is accessible in every moment.
     */
    function init(config) {
        var $this = $(this);
        // prevent multiple initialisation
        if ($this.data("jsbox") && $this.data("jsbox") !== true) {
            return;
        }
        config = $.extend(true, {}, config, buildConfig($this));
        var jsbox = createJsbox(config);
        // chained jsboxes
        initChained(jsbox, config, $this);
        // plugin reference and events
        $this.addClass("jsbox-plugin-enabled").after(jsbox.getEl()).data("jsbox", jsbox).trigger("jsbox-ready", jsbox);
    }
    function initChained(jsbox, config, $this) {
        if (!config.next) {
            return;
        }
        var $next, nextBox;
        if (config.next === "next") {
            $next = $this.nextAll("[data-jsbox]").first();
        } else {
            $next = $(config.next);
        }
        $next.on("jsbox-ready", function(e, instance) {
            nextBox = instance;
            nextBox.setEnabled(false);
        });
        jsbox.on("success", function() {
            if (nextBox) {
                nextBox.setEnabled(true);
            }
        });
        jsbox.on("dispose", function() {
            if (nextBox) {
                nextBox.setEnabled(true);
            }
        });
    }
    /**
     * Destroy and remove a JSBox instance from memory and DOM Data
     */
    function dispose() {
        var $this = $(this);
        var jsbox = $this.data("jsbox");
        if (jsbox) {
            jsbox.dispose();
            jsbox = null;
            $.removeData(this, "jsbox");
        }
        $this.removeClass("jsbox-plugin-enabled");
    }
})(jQuery);
})();
