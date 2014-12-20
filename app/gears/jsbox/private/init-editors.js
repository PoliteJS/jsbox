/**
 * JSBox // private // initEditors()
 */

var getConstructor = require('utils/get-constructor');

function JSBox__initEditors() {
	var self = this;
	['html','css','js'].forEach(initEditor);

	function initEditor(language) {
		var config = self.options.panels[language];
		var Editor = null;
		var editor = null;

		if (!config.enabled) {
			return;
		}

		// build editor instance
		Editor = getConstructor(config.type, self.options.custom.editor);
		editor = new Editor(language, config, self.channel);

		// set initial content
		if (config.content) {
			editor.set(config.content);
		}

		self.data[language + 'IsEnabled'] = config.enabled;
		self.data.panels[language] = editor;
	}
}

module.exports = JSBox__initEditors;
