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
        init: function(target, source) {
            this.target = target;
            this.source = source || 'simple';
            
        },
        dispose: function() {},
        render: function(data) {
            switch (this.source) {
                case 'simple':
                    renderSimple(this.target, data);
                    break;
                case 'advanced':
                    dom.append("-- JSBox Advance Template yet to be implemented--", this.target);
                    break;
                default:
                    dom.append("-- JSBox unknown template--", this.target);
            }
        }
    };
    
    
    function renderSimple(target, data) {
        target.classList.add('jsbox-tpl-simple');
        var keys = Object.keys(data);
        ['html','css','js','testsList','sandbox','logger'].forEach(function(key) {
            if (keys.indexOf(key) !== -1) {
                var wrapper = dom.create('div', null, 'jsbox-tpl-wrapper jsbox-tpl-wrapper-' + key);
                dom.append(data[key], wrapper);
                dom.append(wrapper, target);
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
