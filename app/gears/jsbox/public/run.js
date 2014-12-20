/**
 * JSBox.run()
 */

var getEditorContent = require('../private/get-editor-content');

function JSBox__run() {
	var sandbox = this.sandbox;
	sandbox.reset();
	sandbox.run({
		html: getEditorContent.call(this, 'html'),
		css: getEditorContent.call(this, 'css'),
		js: getEditorContent.call(this, 'js')
	});
}

module.exports = JSBox__run;
