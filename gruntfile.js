module.exports = function(grunt) {

  grunt.initConfig({
    copy: {
      main: {
        expand: true,
        cwd: 'src',
        src: '*.svg',
        dest: 'dist/'
      },
      vars: {
        files: {
          'dist/vars.js': 'src/vars.js'
        }
      }
    },
    htmlmin: {
      main: {
        options: {
            removeComments: true,
            collapseWhitespace: true
        },
        files: {
            'dist/index.html': 'src/index.html',
            'dist/picker.html': 'src/picker.html',
            'dist/floor.html': 'src/floor.html',
            'dist/tower.html': 'src/tower.html',
            'dist/error.html': 'src/error.html',
            'dist/home.html': 'src/home.html',
            'dist/about.html': 'src/about.html',
        }
      }
    },
    uglify: {
      base: {
        files: {
          'dist/base.js': ['src/base.js'],
          'dist/links.js': ['src/links.js'],
        }
      }
    },
    less: {
        main: {
            options: {
                compress: true
            },
            files: {
                'dist/index.css':'src/index.less',
                'dist/picker.css':'src/picker.less',
                'dist/floor.css':'src/floor.less',
                'dist/base.css':'src/base.less',
                'dist/home.css':'src/home.less',
                'dist/about.css':'src/about.less',
            }
        }
    },
    cssmin: {
        main: {
            options: {
                removeComments: true,
                collapseWhitespace: true
            },
            files: {
                'dist/index.css': 'dist/index.css',
                'dist/picker.css': 'dist/picker.css',
                'dist/floor.css': 'dist/floor.css',
                'dist/base.css': 'dist/base.css',
                'dist/home.css': 'dist/home.css',
                'dist/about.css': 'dist/about.css',
            }
        }
    },
    inline: {
        index: {
            options: {
              uglify: false
            },
            src: 'dist/index.html',
            dest: 'dist/index.html'
        },
        picker: {
            src: 'dist/picker.html',
            dest: 'dist/picker.html'
        },
        floor: {
            src: 'dist/floor.html',
            dest: 'dist/floor.html'
        },
        tower: {
            src: 'dist/tower.html',
            dest: 'dist/tower.html'
        },
        error: {
            src: 'dist/error.html',
            dest: 'dist/error.html'
        },
        home: {
            src: 'dist/home.html',
            dest: 'dist/home.html'
        },
        about: {
            src: 'dist/about.html',
            dest: 'dist/about.html'
        }
    },
    watch: {
      client: {
        files: ['src/*.*'],
        tasks: ['copy', 'htmlmin', 'uglify', 'less', 'inline', 'rename', 'express:main'],
        options: {
          spawn: false
        }
      },
      server: {
        files: ['server.js'],
        tasks: ['express:main'],
        options: {
          spawn: false
        }
      }
    },
    express: {
        main: {
            options: {
                script: 'server.js'
            }
        }
    },
    rename: {
      main: {
        files: [
          {src: 'dist/index.html', dest: 'dist/index.mustache'},
          {src: 'dist/picker.html', dest: 'dist/picker.mustache'},
          {src: 'dist/floor.html', dest: 'dist/floor.mustache'},
          {src: 'dist/tower.html', dest: 'dist/tower.mustache'},
          {src: 'dist/error.html', dest: 'dist/error.mustache'},
          {src: 'dist/home.html', dest: 'dist/home.mustache'},
          {src: 'dist/about.html', dest: 'dist/about.mustache'},
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-rename');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-express-server');
  grunt.loadNpmTasks('grunt-inline');

  grunt.registerTask('server', ['copy', 'htmlmin', 'uglify', 'less', 'inline', 'rename', 'express', 'watch']);

};
