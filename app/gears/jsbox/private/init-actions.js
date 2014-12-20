/**
 * JSBox // private // initActions()
 */

function JSBox__initActions() {
	var self = this;
	
	this.channel.on('cmd:run', function() {
		self.run();
	});

	this.channel.on('cmd:reset', function() {
		self.reset();
	});
	
}

module.exports = JSBox__initActions;
