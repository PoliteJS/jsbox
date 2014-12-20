
function BasicConsole() {
	console.log("Init Basic Console");
	this.el = document.createElement('div');
	this.el.innerHTML = 'Basic Console';
}

module.exports = BasicConsole;
