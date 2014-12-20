/**
 * JSBox // private // getEditorContent()
 *
 * fetch the value of an editor panel from a given scope
 * using the language name to identify the editor.
 *
 */

function JSBox__getEditorContent(language) {
	if (this[language] && this[language].get) {
		return this[language].get();
	}
	return '';
}

module.exports = JSBox__getEditorContent;
