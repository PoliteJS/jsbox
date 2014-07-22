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
            this.el = dom.create('ul', null, 'jsbox-logger');
            this.logs = [];
        },
        dispose: function() {
            this.reset();
            dom.remove(this.el);
        },
        push: function(type, message) {
            var logEl = dom.create('li', null, 'jsbox-logger-item jsbox-logger-item-' + type, message);
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
