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
    function htmlEscape(str) {
        var pattern = {
            '&': '&amp;',
            '"': '&quot',
            '\'': '&#39',
            '<': '&lt;',
            '>': '&gt;'
        };
        return String(str)
            .replace(/(?:&|"|'|<|>)/g, function(match) {
                if (pattern.hasOwnProperty(match)) {
                    return pattern[match];
                }
                return match;
            });
    }
    function loggify(item) {
        var objectList = [];
        
        function recursiveLoggify(item, className) {
            var el = dom.$create('span', null, typeof item);
            switch (typeof item) {
                case 'string':
                    el.append('"' + htmlEscape(item) + '"');
                    break;

                case 'function':
                    el.append(item.toString());
                    break;

                case 'boolean':
                    el.append(item.toString().toUpperCase());
                    break;

                case 'undefined':
                    el.append('undefined');
                    break;

                case 'object':
                    if (item === null) {
                        el.append('null');
                        break;
                    }
                    if (objectList.indexOf(item) !== -1) {
                        el.append(item.toString());
                        console.warn('Recursive Object!');
                        break;
                    }
                    objectList.push(item);
                    var header = el;
                    header.addClass('jsbox-logger-header');
                    var content = dom.$create('div', null, typeof item);
                    content.hide();
                    el = dom.$create('div', null, typeof item);
                    if (className) {
                        el.addClass(className);
                    }
                    el.append(header);
                    el.append(content);
                    header.append(item.toString());
                    var icon = dom.$create('span', null, 'jsbox-logger-icon');
                    header.append(icon);
                    var init = true;
                    header.click(function() {
                        if (init) {
                            init = false;
                            Object.keys(item).map(function(key) {
                                var prop = dom.$create('div', null, 'jsbox-logger-content');
                                content.append(prop);
                                prop.append(dom.$create('span', null, 'jsbox-logger-property', key + ':'));
                                setTimeout(function() {
                                    prop.append(recursiveLoggify(item[key], 'jsbox-logger-property'));
                                }, 0);
                            });
                        }
                        content.toggle();
                        icon.toggleClass('jsbox-logger-selected');
                    });
                    break;

                default:
                    el.append(item);
                    break;
            }

            return el;
        }
        
        return recursiveLoggify(item, '');
    }
    
    var LoggerEngine = {
        init: function() {
            this.el = dom.create('ul', null, 'jsbox-logger');
            this.logs = [];
        },
        dispose: function() {
            this.reset();
            dom.remove(this.el);
        },
        push: function(type, message) {
            var logEl = dom.$create('li', null, 'jsbox-logger-item jsbox-logger-item-' + type);
            if (Array.isArray(message)) {
                message.map(function(item) {
                    logEl.append(loggify(item));
                });
            } else {
                logEl.append(message);
            }
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
