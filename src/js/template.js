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
                default:
                    dom.append("-- JSBox unknown template--", this.target);
            }
        }
    };
    
    
    function renderSimple(target, data) {
        var keys = Object.keys(data);
        ['html','css','js','sandbox'].forEach(function(key) {
            if (keys.indexOf(key) !== -1) {
//                var el = dom.create('div', null, 'jsbox-wrapper-' + key, data[key]);
                dom.append(data[key], target);
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
