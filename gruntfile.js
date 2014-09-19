module.exports = function (grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    coffeelint: {
      files: {
        src: ['src/coffee/**/*.coffee']
      },
      options: {
        configFile: 'coffeelint.json'
      }
    },

    coffee: {
      compile: {
        expand: true,
        flatten: true,
        src: ['src/coffee/**/*.coffee'],
        dest: 'src/js/',
        ext: '.js'
      }
    },

    watch: {
      karma: {
        files: ['src/coffee/**/*.coffee'],
        tasks: ['coffeelint', 'coffee', 'karma:unit:run']
      }
    },

    karma: {
      unit: {
        configFile: 'test/test.conf.js',
        background: true,
        singleRun: false
      },
      continuous: {
        configFile: 'test/test.conf.js',
        singleRun: true
      }
    },

    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: ['src/js/*.js'],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },

    browserify: {
      dist: {
        files: {
          '<%= concat.dist.dest %>': ['<%= concat.dist.dest %>']
        }
      }
    },

    uglify: {
      options: {
        sourceMap: true,
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
        }
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-coffeelint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-karma');


  grunt.registerTask('default', ['coffeelint', 'coffee', 'karma:continuous']);
  grunt.registerTask('dist', ['coffeelint', 'coffee', 'concat', 'browserify', 'uglify']);

};
