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
                visible: false,
                libs: []
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
        
        $artifax = $el.find('[data-artifax]')
        if ($artifax.length) {
            if ($artifax.children().length) {
                config.sandbox.artifax = [];
                $artifax.children().each(function() {
                    config.sandbox.artifax.push($(this).html());
                });
            } else {
                config.sandbox.artifax = [$artifax.html()];
            }
        }
        
        // js source fallback to the first "code" tag
        $code = $el.find('code').filter(function() {
            var $this = $(this);
            if ($this.attr('data-html') !== undefined || 
                $this.attr('data-css') !== undefined || 
                $this.attr('data-js') !== undefined ||
                $this.attr('data-artifax') !== undefined) {
                return false;
            }
            return true;
        });
        if (!$js.length && $code.length) {
            config.editors.js = $code.html();
        }
        
        if ($el.attr('data-jsbox-scripts')) {
            config.sandbox.scripts = $el.attr('data-jsbox-scripts').split(',');
        }
        if ($el.attr('data-jsbox-styles')) {
            config.sandbox.styles = $el.attr('data-jsbox-styles').split(',');
        }
        
        // tests fallback to the first "ul" tag
        $tests = $el.find('[data-test]');
        if (!$tests.length) {
            $tests = $el.find('>ul').filter(function() {
                var $this = $(this);
                if ($this.attr('data-artifax') !== undefined || 
                    $this.attr('data-scripts') !== undefined || 
                    $this.attr('data-styles') !== undefined) {
                    return false;
                }
                return true;
            });
        }
        if ($tests.children().length) {
            $tests.children().each(function() {
                config.tests.push({
                    code: $(this).html(),
                    label: $(this).attr('title')
                });
            });
        } else {
            config.tests.push({
                code: $tests.html(),
                label: $tests.attr('title')
            });
        }
        
        // chained boxes support
        if ($el.is('[data-jsbox-lock]')) {
            config.next = $el.attr('data-jsbox-next', 'next');
        }
        if ($el.attr('data-jsbox-next')) {
            config.next = $el.attr('data-jsbox-next');
        }
        
        console.log(config);
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
        initChained(jsbox, config, $this);
        
        // plugin reference and events
        $this
        .addClass('jsbox-plugin-enabled')
        .after(jsbox.getEl())
        .data('jsbox', jsbox)
        .trigger('jsbox-ready', jsbox);

    }
    
    function initChained(jsbox, config, $this) {
        if (!config.next) {
            return;
        }
        var $next, nextBox;

        if (config.next === 'next') {
            $next = $this.nextAll('[data-jsbox]').first();
        } else {
            $next = $(config.next);
        }

        $next.on('jsbox-ready', function(e, instance) {
            nextBox = instance;
            nextBox.setEnabled(false);
        });

        jsbox.on('passed', function() {
            if (nextBox) {
                nextBox.setEnabled(true);
            }
        });

        jsbox.on('dispose', function() {
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
