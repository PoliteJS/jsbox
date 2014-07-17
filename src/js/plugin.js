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

    config = $.extend({}, config, {
        next: $this.attr('data-jsbox-next') || ''
    });

    var instance = Object.create(JSBox);
    instance.init(this, config);
    $this.data('jsbox', instance);

    // lock next exercise
    if (config.next) {
        var next;
        $(document).delegate(config.next, 'jsbox-ready', function(e, _next) {
            next = _next;
            next.disable();
        });
        instance.on('status', function(status) {
            if (status && next) {
                next.enable();
            }
        });
    }

    $this.trigger('jsbox-ready', instance);

}

/**
 * Destroy and remove a JSBox instance from memory and DOM Data
 */
function dispose() {
    var instance = $(this).data('jsbox');
    if (instance) {
        instance.dispose();
        instance = null;
        $.removeData(this, 'jsbox');
    }
}

/**
 * Global writable defaults
 */
$.jsboxDefaults = {
    code: '',
    codeQuery: 'code',
    tests: [],
    testsQuery: 'ul>li',
    editor: null, // custom editor adapter
    sandbox: null, // custom text execution sandbox 
    updateDelay: 300
};

/**
 * jQuery Plugin
 */
$.fn.jsbox = function() {

    var args = Array.prototype.slice.call(arguments);

    // simple setup
    if (!args.length) {
        $(this).each(init, [$.jsboxDefaults]);

    // config setup
    } else if ($.isPlainObject(args[0])) {
        var config = $.extend({}, $.jsboxDefaults, args[0]);
        $(this).each(init, [config]);

    // custom call with string params
    } else {
        switch (args[0]) {
            case 'instance':
                return $(this).data('jsbox');
            case 'dispose':
                $(this).each(dispose);
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