module.exports = function(grunt) {
    var config = {};

    grunt.initConfig({
    	concat: {
    	    options: {
    	      separator: ';\n\n',
    	    },
    	    dist: {
    	      src: ['www/js/src/index.js', 'www/js/src/geo.js', 'www/js/src/ble.js', 'www/js/src/status.js'],
    	      dest: 'www/js/main.js',
    	    },
    	  },
    	  // Arbitrary non-task-specific properties.
    	  my_property: 'whatever',
    	  my_src_files: ['www/js/*.js'],
    	});
    
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
};