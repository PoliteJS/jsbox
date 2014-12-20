/**
 * JSBox Global Values
 */

exports.defaults = {
	target: null,
	template: 'default',
	panels: {
		html: {
			enabled: true,
			type: 'default'
		},
		css: {
			enabled: true,
			type: 'default'
		},
		js: {
			enabled: true,
			type: 'default'
		},
		console: {
			enabled: true,
			type: 'default'
		},
		sandbox: {
			enabled: true,
			type: 'default'
		}
	},
	commands: {
		run: {
			enabled: true,
			type: 'default'
		},
		// reset: {
		// 	enabled: false,
		// 	type: 'default'
		// },
		// fullScreen: {
		// 	enabled: false,
		// 	type: 'default'
		// },
		// toggleConsole: {
		// 	enabled: false,
		// 	type: 'default'
		// }
	},
	custom: {
		template: {
			default: require('./templates/simple.html')
		},
		editor: {
			default: require('editor-basic/basic-editor')
		},
		console: {
			default: require('console-basic/basic-console')
		},
		sandbox: {
			default: require('sandbox-basic/basic-sandbox')
		},
		cmd: {
			run: {
				default: require('cmd-run/run-cmd')
			}
		}
	}
};

exports.data = {
	panels: {
		html: null,
		css: null,
		js: null,
		console: null,
		output: null
	},
	commands: {
		run: null,
		reset: null,
		fullScreen: null,
		toggleConsole: null
	}
};
