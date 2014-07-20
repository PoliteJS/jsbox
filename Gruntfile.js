/**
 * JSBox Building Tool
 * ===================
 *
 *
 */

module.exports = function (grunt) {
    
    
    var jsModules = [
        'src/js/utils/extend.js',
        'src/js/utils/pubsub.js',
        'src/js/utils/dom.js',
        'src/js/text-editor.js',
        'src/js/sandbox.js',
        'src/js/jsbox.js',
        'src/js/plugin.js'
    ];
    
    var jsWrapperStart = grunt.file.read('src/js/wrapper-start.js');
    var jsWrapperEnd = grunt.file.read('src/js/wrapper-end.js');
        
    
// --------------------------------------- //
// ---[[   G R U N T   C O N F I G   ]]--- //
// --------------------------------------- //
    
	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),
        
        clean: {
			build: ['build'],
            release: ['release']
		},
        
        uglify: {
            build: {
                options: {
                    mangle: false,
                    compress: false,
                    beautify: true,
                    preserveComments: true,
                    banner: jsWrapperStart,
                    footer: jsWrapperEnd,
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
                    banner: jsWrapperStart,
                    footer: jsWrapperEnd
                },
                files: {
                    'release/jquery.jsbox-<%= pkg.version %>.js' : jsModules
                }
            },
            'release-min': {
                options: {
                    banner: jsWrapperStart,
                    footer: jsWrapperEnd
                },
                files: {
                    'release/jquery.jsbox-<%= pkg.version %>.min.js' : jsModules
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
                files: {
                    'release/jquery.jsbox-<%= pkg.version %>.css' : 'src/less/jsbox.less'
                }
            },
            'release-min': {
                options: {
                    compress: true,
                    cleancss: true
                },
                files: {
                    'release/jquery.jsbox-<%= pkg.version %>.min.css' : 'src/less/jsbox.less'
                }
            }
        },
        
        usebanner: {
            build: {
                options: {
                    position: 'top',
                    banner: '/* JSBox v<%= pkg.version %> - DEVELOPEMENT VERSION | by Marco Pegoraro | http://politejs.com/jsbox */'
                },
                files: {
                    src: [
                        'build/*.js', 'build/*.css'
                    ]
                }
            },
            release: {
                options: {
                    position: 'top',
                    banner: '/* JSBox v<%= pkg.version %> | by Marco Pegoraro |http://politejs.com/jsbox */'
                },
                files: {
                    src: [
                        'release/*.js', 'release/*.css'
                    ]
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
        'less:build',
        'usebanner:build'
    ]);
    
    grunt.registerTask('release', [
        'clean:release',
        'uglify:release',
        'uglify:release-min',
        'less:release',
        'less:release-min',
        'usebanner:release'
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
    grunt.loadNpmTasks('grunt-banner');
    

    
    
// --------------------------------------- //
// ---[[   C U S T O M   T A S K S   ]]--- //
// --------------------------------------- //
    
    
    
};
