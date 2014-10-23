module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    coffee: {
      compile: {
        expand: true,
        flatten: true,
        src: ['src/**/*.coffee'],
        dest: 'src/js/',
        ext: '.js'
      },
      compile_tests: {
        expand: true,
        flatten: true,
        src: ['spec/**/*.coffee'],
        dest: 'spec/js',
        ext: '.js'
      }
    },

    karma: {
      unit: {
        configFile: 'spec/spec.conf.js',
        background: true,
        singleRun: false
      },
      continuous: {
        configFile: 'spec/spec.conf.js',
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
    },

    coffeelint: {
      files: {
        src: ['src/coffee/**/*.coffee', 'test/spec/coffee/**/*.coffee']
      },
      options: {
        configFile: 'coffeelint.json'
      }
    },

    watch: {
      karma: {
        files: ['src/coffee/**/*.coffee'],
        tasks: ['coffeelint', 'coffee', 'concat', 'browserify', 'karma:unit:run']
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

  grunt.registerTask('default', [
    'coffeelint', 'coffee',
    'concat', 'browserify',
    'karma:continuous'
  ]);
  grunt.registerTask('dist', [
    'coffeelint', 'coffee',
    'concat', 'browserify',
    'uglify'
  ]);
};
