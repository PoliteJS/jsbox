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
        },
        dispose: function() {
            dom.empty(this.el);
        }
    };
    
    
    function renderSimple(target, options, box) {
        target.classList.add('jsbox-tpl-simple');

        var editors = dom.create('div', null, 'jsbox-tpl-wrapper-editors');
        for (var key in box.editors) {
            var wrapper = dom.create('div', null, 'jsbox-tpl-wrapper jsbox-tpl-wrapper-' + key);
            dom.append(box.editors[key].el, wrapper);
            dom.append(wrapper, editors);
        }
                
        dom.append(editors, target);
        
        ['testsList','sandbox','logger'].forEach(function(key) {
            var wrapper = dom.create('div', null, 'jsbox-tpl-wrapper jsbox-tpl-wrapper-' + key);                
            dom.append(box[key].el, wrapper);
            dom.append(wrapper, target);
        });
        
    }
    
    
    // Factory Method
    templateEngine.create = function(target, source) {
        var instance = Object.create(TemplateEngine);
        instance.init(target, source);
        return instance;
    };

})();
