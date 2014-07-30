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
            this.options = box.options.template || {};
            
            if (typeof this.options === 'string') {
                this.options = {
                    name: this.options
                };
            }
            
            this.options = extend({
                name: 'simple'
            }, this.options);
            
            switch (this.options.name) {
                case 'simple':
                    renderSimple(this.el, this.options, this.box);
                    break;
                case 'advanced':
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
        target.classList.add('jsbox-tpl-simple');

        // editors
        var editors = dom.create('div', null, 'jsbox-tpl-wrapper-editors');
        for (var key in box.editors) {
            var wrapper = dom.create('div', null, 'jsbox-tpl-wrapper jsbox-tpl-wrapper-' + key);
            dom.append(box.editors[key].el, wrapper);
            dom.append(wrapper, editors);
        }
        dom.append(editors, target);
        
        // components
        ['logger','testsList','sandbox'].forEach(function(key) {
            var wrapper = dom.create('div', null, 'jsbox-tpl-wrapper jsbox-tpl-wrapper-' + key);                
            dom.append(box[key].el, wrapper);
            dom.append(wrapper, target);
        });
        
        // buttons
        var buttons = dom.create('div', null, 'jsbox-tpl-wrapper-buttons');
        var execBtn = dom.create('button', null, 'jsbox-cmd jsbox-cmd-execute', 'Run &raquo;');
        var resetBtn = dom.create('button', null, 'jsbox-cmd jsbox-cmd-reset', 'Reset');
        
        dom.addEvent(execBtn, 'click', box.execute.bind(box));
        dom.addEvent(resetBtn, 'click', box.reset.bind(box));
        
        dom.append(resetBtn, buttons);
        dom.append(execBtn, buttons);
        dom.append(buttons, target);
        
        // overlay
        var overlay = dom.create('div', null, 'jsbox-tpl-overlay', '<p>please complete the previous exercises!</p>');
        dom.append(overlay, target);
    }
    
    
    /**
     * Exposes JSBOX status through DOM classes 
     */
    
    function initEvents(box) {
        
        var _activeTimer = null;
        
        dom.addEvent(box.el, 'click', function() {
            if (box.isEnabled()) {
                if (!box.isActive()) {
                    box.setActive(true);
                    dom.removeClass(box.el, 'jsbox-failed');
                }
            }
        });
        
        box.on('enabled-status-changed', function(status) {
            if (status) {
                dom.addClass(box.el, 'jsbox-enabled');
                dom.removeClass(box.el, 'jsbox-disabled');
            } else {
                dom.removeClass(box.el, 'jsbox-enabled');
                dom.addClass(box.el, 'jsbox-disabled');
            }
        });
        
        box.on('active-status-changed', function(status) {
            if (status) {
                dom.addClass(box.el, 'jsbox-active');
            } else {
                dom.removeClass(box.el, 'jsbox-active');
            }
        });
        
        box.sandbox.on('reset', function(scope) {
            dom.removeClass(box.el, 'jsbox-success');
            dom.removeClass(box.el, 'jsbox-failed');
        });
        
        box.sandbox.on('start', function(scope) {
            dom.removeClass(box.el, 'jsbox-success');
            dom.removeClass(box.el, 'jsbox-failed');
            dom.addClass(box.el, 'jsbox-running');
        });

        box.sandbox.on('finish', function(scope, result) {
            dom.removeClass(box.el, 'jsbox-running');
            if (result === true) {
                dom.addClass(box.el, 'jsbox-success');
            }
            if (result === false) {
                dom.addClass(box.el, 'jsbox-failed');
            }
            
            // remove failure classes for an active box
            if (box.isActive()) {
                clearTimeout(box.template._checkActiveTimer);
                box.template._checkActiveTimer = setTimeout(function() {
                    dom.removeClass(box.el, 'jsbox-failed');
                }, 1500);
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
