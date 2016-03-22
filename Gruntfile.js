module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),
        asset_path: 'assets/',
        public_path: 'public/',
        static_dev: 'dev/',
        static_staging: 'public/static/',
        static_twig_path: 'static_twig/',

        watch: {
            sass: {
                files: [
                    '<%= asset_path %>sass/*',
                    '<%= asset_path %>sass/*/*'
                ],
                tasks: ['compass:dev']
            },

            output_twig: {
              files: [
                  '<%= static_twig_path %>*',
                  '<%= static_twig_path %>*/*'
              ],
              tasks: ['output_twig:dev']
            },

            watchFiles: {
                files: [
                    '<%= public_path %>js/max/*',
                    '*.php',
                    'partials/*',
                    'static/*',
                    'static/*/*',
                    'page_sections/*',
                    'craft/templates/*',
                    'craft/templates/*/*',
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
        },

      output_twig: {

        // STAGING VERSION
        dev: {
          options: {
            // docroot: 'test/templates/'
            docroot: '<%= static_twig_path %>/',
            tmpext: '.twig',
            context: {
              isDev: true,
              assetPath: '/<%= public_path %>',
              siteName: 'site name',
              siteUrl: 'site.dev'
            }
          },
          files: [
            {
              expand: true,
              cwd: '<%= static_twig_path %>/',
              src: ['**/*.twig','!_**/*', '!**/_*', '!_*'],
              dest: '<%= static_dev %>',
              ext: '.html'
            }
          ]
        },

        // STAGING VERSION
        staging: {
          options: {
            // docroot: 'test/templates/'
            docroot: '<%= static_twig_path %>/',
            tmpext: '.twig',
            context: {
              isDev: false,
              assetPath: '/',
              siteName: 'site name',
              siteUrl: 'site.dev'
            }
          },
          files: [
            {
              expand: true,
              cwd: '<%= static_twig_path %>/',
              src: ['**/*.twig','!_**/*', '!**/_*', '!_*'],
              dest: '<%= static_staging %>',
              ext: '.html'
            }
          ]
        }
      }

    }); // end init config

    // Load grunt plugins.
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-browser-sync');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-webfont');
    grunt.loadNpmTasks('grunt-output-twig');

    //register tasks

    //watch with css inject
    grunt.registerTask('default', ["browserSync", "watch"]);

    // compile all files that need compiling
    grunt.registerTask('c', ['compass', 'uglify', 'output_twig']);

    // make icon font
    grunt.registerTask('icons', ['webfont']);

    // compile twig
    grunt.registerTask('twig', ['output_twig']);

    grunt.registerTask("js", ["uglify:compile_scripts"])
    grunt.registerTask("sass", ["compass"])
    grunt.registerTask("plug", ["uglify:compile_plugins"])

};