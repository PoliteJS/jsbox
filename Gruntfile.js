/**
 * JSBox Building Tool
 * ===================
 *
 *
 */

module.exports = function (grunt) {
    
    
    var jsModules = [
        'src/js/pubsub.js',
        'src/js/editor.js',
        'src/js/sandbox.js',
        'src/js/jsbox.js',
        'src/js/plugin.js'
    ];
    
    
// --------------------------------------- //
// ---[[   G R U N T   C O N F I G   ]]--- //
// --------------------------------------- //
    
	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),
        
        clean: {
			build: ['build']
		},
        
        uglify: {
            build: {
                options: {
                    mangle: false,
                    compress: false,
                    beautify: true,
                    preserveComments: true,
                    banner: '(function($) {\n\n',
                    footer: '\n\n})(jQuery);',
                    sourceMap: true,
                    sourceMapFilename: 'jquery.jsbox.js.map'
                },
                files: {
                    'build/jquery.jsbox.js' : jsModules
                }
            },
            release: {
                options: {
                    mangle: false,
                    compress: false,
                    beautify: true,
                    preserveComments: true,
                    banner: '(function($) {\n\n',
                    footer: '\n\n})(jQuery);'
                },
                files: {
                    'build/jquery.jsbox.js' : jsModules
                }
            },
            'release-min': {
                options: {
                    banner: '(function($) {',
                    footer: '})(jQuery);'
                },
                files: {
                    'build/jquery.jsbox.min.js' : jsModules
                }
            }
        },
        
        less: {
            build: {
                options: {
                    sourceMap: true,
                    sourceMapFilename: 'build/jquery.jsbox.css.map',
                    sourceMapRootpath: '../'
                },
                files: {
                    'build/jquery.jsbox.css' : 'src/less/jsbox.less'
                }
            },
            release: {
                options: {
                    
                },
                files: {
                    'build/jquery.jsbox.css' : 'src/less/jsbox.less'
                }
            },
            'release-min': {
                options: {
                    compress: true,
                    cleancss: true
                },
                files: {
                    'build/jquery.jsbox.min.css' : 'src/less/jsbox.less'
                }
            }
        },
        
        watch: {
            build: {
                files: ['src/**/*'],
                tasks: ['build']
            }
        }
		
	});
    
    
    
    
    
// ----------------------------------------------- //
// ---[[   P U B L I C   I N T E R F A C E   ]]--- //
// ----------------------------------------------- //
    
    grunt.registerTask('build', [
        'clean:build',
        'uglify:build',
        'less:build'
    ]);
    
    grunt.registerTask('release', [
        'clean:build',
        'uglify:release',
        'uglify:release-min',
        'less:release',
        'less:release-min'
    ]);
        
    grunt.registerTask('develop', [
        'build',
        'watch:build'
    ]);
    
    grunt.registerTask('default', ['build']);
    
    
    
    
    
// --------------------------------------------------- //
// ---[[   L O A D   G R U N T   M O D U L E S   ]]--- //
// --------------------------------------------------- //
    
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-uglify');
    

    
    
// --------------------------------------- //
// ---[[   C U S T O M   T A S K S   ]]--- //
// --------------------------------------- //
    
    
    
};
