
var $ = require('jquery');

var create = require('../create');

describe('JSBox / Create', function() {

	it('should append the box to a target item by config', function() {
		var $target = $('<div>');
		var box = create({
			target: $target[0],
			template: '<spec>test</spec>'
		});
		expect($target.find('spec').text()).to.equal('test');
	});

});