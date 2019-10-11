module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),
        asset_path: 'assets/',
        public_path: 'cole/',

        watch: {
            sass: {
                files: [
                    '<%= asset_path %>sass/*',
                    '<%= asset_path %>sass/*/*'
                ],
                tasks: ['compass:dev']
            },

            watchFiles: {
                files: [
                    '<%= public_path %>js/max/*'
                ],
                options: {
                    livereload: true
                }
            },

            uglify: {
                files: [
                    '<%= asset_path %>scripts/*'
                ],
                tasks: ['uglify:compile_scripts']
            },

            webfont: {
                files: [
                    '<%= asset_path %>icons/*.svg'
                ],
                tasks: ['webfont']
            }   
        },

        browserSync: {
            options: {
                watchTask: true,
            },
            files: {
                src: ['<%= public_path %>css/max/*.css', '<%= public_path %>gfx/*']
            }
        },


        uglify: {

            compile_scripts: {
                options: {
                    mangle: false,
                    beautify: true,
                    compress: false,
                    sourceMap: true
                },
                files: {
                    '<%= public_path %>js/max/scripts.js': ['<%= asset_path %>scripts/*.js']
                }  
            },

            compile_plugins: {
                options: {
                    mangle: false,
                    beautify: false,
                    compress: true,
                    sourceMap: true
                },
                files: {
                    '<%= public_path %>js/plugins.js': ['<%= asset_path %>plugins/*.js']
                }
            },

            compile_all: {
                options: {
                    mangle: true,
                    beautify: false,
                    compress: {
                        drop_console: true
                    }
                },
                files: {
                    '<%= public_path %>js/min/scripts.js': ['<%= asset_path %>plugins/*.js','<%= public_path %>js/max/scripts.js']
                }
            },
        },

        compass: {
            dev: {
                options: {
                    sassDir: '<%= asset_path %>sass',
                    cssDir: '<%= public_path %>css/max',
                    outputStyle: 'nested',
                    sourcemap: true
                }
            },
            dist: {
                options: {
                    sassDir: '<%= asset_path %>sass',
                    cssDir: '<%= public_path %>css/min',
                    outputStyle: 'compressed'
                }
            }
        },

        webfont: {
          icons: {
            src: '<%= asset_path %>icons/*.svg',
            dest: '<%= public_path %>Fonts/icons',
            destCss: '<%= asset_path %>sass/common',
            
            options: {
              stylesheet: 'scss',
              // template: 'icons/templates/_icon_template.scss',
              relativeFontPath: '../../fonts/icons/',
              destHtml: '<%= public_path %>Fonts/icons/preview',
              ligatures: false,
              engine: 'node',
              templateOptions: {
                baseClass: 'icon',
                classPrefix: 'icon_',
                mixinPrefix: 'icon-'
              }
            }
          }
        }

    }); // end init config

    // Load grunt plugins.
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-browser-sync');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-webfont');

    //register tasks

    //watch with css inject
    grunt.registerTask('default', ["browserSync", "watch"]);

    // compile all files that need compiling
    grunt.registerTask('c', ['compass', 'uglify']);

    // make icon font
    grunt.registerTask('icons', ['webfont']);

    grunt.registerTask("js", ["uglify:compile_scripts"])
    grunt.registerTask("sass", ["compass"])
    grunt.registerTask("plug", ["uglify:compile_plugins"])

};