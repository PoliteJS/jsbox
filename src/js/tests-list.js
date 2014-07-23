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
            this.el = dom.create('ul', null, 'jsbox-testlist');
            this.tests = [];
            tests.forEach(this.push.bind(this));
        },
        dispose: function() {
            dom.remove(this.el);
        },
        push: function(test) {
            var testEl = dom.create('li', null, 'jsbox-testlist-item', test);
            dom.append(testEl, this.el);
            this.tests.push({
                code: test,
                el: testEl
            });
        },
        getList: function() {
            return this.tests.map(function(item) {
                return item.code;
            });
        },
        reset: function() {
            this.tests.forEach(function(item) {
                dom.removeClass(item.el, 'jsbox-testlist-ok');
                dom.removeClass(item.el, 'jsbox-testlist-ko');
            });
        },
        setStatus: function(test, status) {
            this.tests.filter(function(item) {
                return item.code === test;
            }).forEach(function(item) {
                if (status) {
                    dom.addClass(item.el, 'jsbox-testlist-ok');
                } else {
                    dom.addClass(item.el, 'jsbox-testlist-ko');
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
