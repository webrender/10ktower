module.exports = function(grunt) {

  grunt.initConfig({
    copy: {
      main: {
        expand: true,
        cwd: 'src',
        src: '*.svg',
        dest: 'dist/'
      }
    },
    htmlmin: {
      main: {
        options: {
            removeComments: true,
            collapseWhitespace: true
        },
        files: {
            'dist/index.html': 'src/index.html'
        }
      }
    },
    less: {
        main: {
            options: {
                compress: true
            },
            files: {
                'dist/index.css':'src/index.less'
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
                'dist/index.css': 'dist/index.css'
            }
        }
    },
    inline: {
        main: {
            src: 'dist/index.html',
            dest: 'dist/index.html'
        }
    },
    watch: {
      client: {
        files: ['src/*.*'],
        tasks: ['copy', 'htmlmin', 'less', 'cssmin', 'inline']
      },
      server: {
        files: ['index.js'],
        tasks: ['express:main'],
        options: {
          spawn: false
        }
      }
    },
    express: {
        main: {
            options: {
                script: 'index.js'
            }
        }
    },
    rename: {
      main: {
        files: [
          {src: 'dist/index.html', dest: 'dist/index.mustache'}
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-rename');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-inline');
  grunt.loadNpmTasks('grunt-express-server');

  grunt.registerTask('server', ['copy', 'htmlmin', 'less', 'inline', 'rename', 'express', 'watch']);

};
