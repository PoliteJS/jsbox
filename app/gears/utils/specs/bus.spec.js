
var bus = require('../bus');

describe('Utils/Bus', function() {

	beforeEach(function() {
		bus.init();
	});

	afterEach(function() {
		bus.dispose();
	});

	it('should emit events', function() {
		var spy = sinon.spy();
		bus.subscribe('foo', spy);
		bus.publish('foo');
		expect(spy.called).to.be.true;
	});

	it('should emit events with arguments', function() {
		var spy = sinon.spy();
		bus.subscribe('foo', spy);
		bus.publish('foo', 'a');
		expect(spy.withArgs('a').called).to.be.true;
	});

	it('should dispose a subscription', function() {
		var spy = sinon.spy();
		var ticket = bus.subscribe('foo', spy);
		ticket.dispose();
		bus.publish('foo');
		expect(spy.called).to.be.false;
	});

});