/**
 * DOM Utility Abstraction Layer
 * 
 */


var dom = (function($) {

    return {
        create: function(tag, _id, _class, _html) {
            var $el = $('<' + tag + '>');
            if (_id) {
                $el.attr('id', _id);
            }
            if (_class) {
                $el.addClass(_class);
            }
            if (_html) {
                $el.append(_html);
            }
            return $el[0];
        },
        $create: function(tag, _id, _class, _html) {
            var $el = $('<' + tag + '>');
            if (_id) {
                $el.attr('id', _id);
            }
            if (_class) {
                $el.addClass(_class);
            }
            if (_html) {
                $el.append(_html);
            }
            return $el;
        },
        append: function(el, target) {
            $(target).append(el);
        },
        remove: function(el) {
            $(el).remove();
        },
        empty: function(el) {
            $(el).empty();
        },
        addClass: function(el, className) {
            $(el).addClass(className);
        },
        removeClass: function(el, className) {
            $(el).removeClass(className);
        },
        addEvent: function(el, name, handler) {
            $(el).on(name, handler);
        },
        clearEvents: function(el) {
            $(el).off();
        }
    };

})(jQuery);

