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
            this.el = dom.create('ul', null, 'jsbox-tests-list');
            this.tests = [];
            this.reset();
            tests.forEach(this.push.bind(this));
        },
        dispose: function() {
            dom.remove(this.el);
        },
        push: function(test) {
            var testEl = dom.create('li', null, 'jsbox-tests-list-item', test.label || test.code);
            dom.append(testEl, this.el);
            dom.removeClass(this.el, 'jsbox-tests-list-empty');
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
                dom.addClass(this.el, 'jsbox-tests-list-empty');
            } else {
                dom.removeClass(this.el, 'jsbox-tests-list-empty');
            }
            this.tests.forEach(function(item) {
                dom.removeClass(item.el, 'jsbox-tests-list-item-ok');
                dom.removeClass(item.el, 'jsbox-tests-list-item-ko');
            });
        },
        setStatus: function(test, status) {
            this.tests.filter(function(item) {
                return item.code === test;
            }).forEach(function(item) {
                if (status) {
                    dom.addClass(item.el, 'jsbox-tests-list-item-ok');
                } else {
                    dom.addClass(item.el, 'jsbox-tests-list-item-ko');
                }
            });
        }
    };
    
    // Factory Method
    testsListEngine.create = function(tests) {
        var instance = Object.create(TestsListEngine);
        instance.init(tests || []);
        return instance;
    };

})();
