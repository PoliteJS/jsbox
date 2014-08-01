
function subscribe(obj, event, cb) {
    if (!obj._subscriptions) {
        obj._subscriptions = {};
    }
    if (!obj._subscriptions[event]) {
        obj._subscriptions[event] = [];
    }
    obj._subscriptions[event].push(cb);
}

function publish(obj, event) {
    var args = Array.prototype.slice.call(arguments);
    args.shift();
    args.shift();
    if (obj._subscriptions && obj._subscriptions[event]) {
        obj._subscriptions[event].forEach(function(cb) {
            cb.apply(obj, args);
        });
    }
}

function disposePubSub(obj) {
    if (!obj._subscriptions) {
        return;
    }
    obj._subscriptions = null;
}
