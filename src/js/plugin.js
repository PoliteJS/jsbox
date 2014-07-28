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
            $this.each(init, [$.jsboxDefaults]);

        // config setup
        } else if ($.isPlainObject(args[0])) {
            var config = $.extend({}, $.jsboxDefaults, args[0]);
            $this.each(init, [config]);

        // custom call with string params
        } else {
            switch (args[0]) {
                case 'instance':
                    return $this.data('jsbox');
                case 'dispose':
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
        $('[data-jsbox]').jsbox();
    });
    
    
    
    
    
    
    function buildConfig($el) {
        var $html, $css, $js, $code, $tests;
        var config = {
            editors: {
                html: false,
                css: false,
                js: ''
            },
            sandbox: {
                visible: false
            },
            tests: []
        };
        
        $js = $el.find('[data-js]')
        if ($js.length) {
            config.editors.js = $js.html();
        }
        
        $css = $el.find('[data-css]')
        if ($css.length) {
            config.editors.css = $css.html();
            config.sandbox.visible = true;
        }
        
        $html = $el.find('[data-html]')
        if ($html.length) {
            config.editors.html = $html.html();
            config.sandbox.visible = true;
        }
        
        $code = $el.find('code').filter(function() {
            var $this = $(this);
            if ($this.attr('data-html') !== undefined || 
                $this.attr('data-css') !== undefined || 
                $this.attr('data-js') !== undefined) {
                return false;
            }
            return true;
        });
        
        if (!$js.length && $code.length) {
            config.editors.js = $code.html();
        }
        
        $tests = $el.find('[data-tests]');
        if (!$tests.length) {
            $tests = $el.find('>ul');
        }
        $tests.children().each(function() {
            config.tests.push($(this).html());
        });
        
        if ($el.attr('data-jsbox-next')) {
            config.next = $el.attr('data-jsbox-next');
        }
        
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
        if ($this.data('jsbox') && $this.data('jsbox') !== true) {
            return;
        }
        
        config = $.extend(true, {}, config, buildConfig($this));
        var jsbox = createJsbox(config);
        
        // chained jsboxes
        // needs to understand how to dispose properly!
        if (config.next) {
            console.log(config.next);
            var next;
            $(document).delegate(config.next, 'jsbox-ready', function(e, _next) {
                next = _next;
                next.disable();
            });
            jsbox.on('passed', function() {
                if (next) {
                    next.enable();
                }
            });
        }
        
        // plugin reference and events
        
        $this
        .addClass('jsbox-plugin-enabled')
        .after(jsbox.getEl())
        .data('jsbox', jsbox)
        .trigger('jsbox-ready', jsbox);

    }

    /**
     * Destroy and remove a JSBox instance from memory and DOM Data
     */
    function dispose() {
        var $this = $(this);
        var jsbox = $this.data('jsbox');
        if (jsbox) {
            jsbox.dispose();
            jsbox = null;
            $.removeData(this, 'jsbox');
        }
        $this.removeClass('jsbox-plugin-enabled')
    }
    

// jQuery Wrapper
})(jQuery);
