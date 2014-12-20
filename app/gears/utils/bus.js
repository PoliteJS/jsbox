/**
 * Simple message bus implementation
 */

var $ = require('jquery');

var subscriptions;

function Bus__init() {
	subscriptions = {};
}

function Bus__dispose() {
	Object.keys(subscriptions).forEach(function(event) {
		subscriptions[event].forEach(function(ticket) {
			ticket.dispose();
		});
	});
}

function Bus__subscribe(event, cb, ctx) {
	if (!subscriptions[event]) {
		subscriptions[event] = [];
	}

	var ticket = {
		callback: cb,
		context: ctx,
		isDisposed: false,
		dispose: Bus__disposeTicket
	};

	subscriptions[event].push(ticket);

	return ticket;

	function Bus__disposeTicket() {
		ticket.isDisposed = true;
		ticket.callback = null;
		ticket.context = null;
		ticket.dispose = null;

		subscriptions[event].splice($.inArray(ticket, subscriptions[event]), 1);
	}
}

function Bus__publish(event) {

	if (!subscriptions[event]) {
		return;
	}

	var args = Array.prototype.slice.call(arguments);
	args.shift();

	subscriptions[event].forEach(function(ticket) {
		ticket.callback.apply(ticket.context, args);
	});
}

module.exports = {
	init: Bus__init,
	dispose: Bus__dispose,
	publish: Bus__publish,
	subscribe: Bus__subscribe
};