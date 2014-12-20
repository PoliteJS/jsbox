


function BasicConsole() {
	console.log("Init Basic Console");
	this.el = document.createElement('div');
	this.el.innerHTML = 'Basic Console';
}

BasicConsole.prototype = {
	reset: require('./public/reset'),
	dispose: require('./public/dispose')
};

module.exports = BasicConsole;
