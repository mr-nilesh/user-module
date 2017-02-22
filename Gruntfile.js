module.exports = function(grunt) {

    function banner() {
        return '/*\n' +
            ' * User Module\n' +
            ' * https://github.com/mr-nilesh/user-module\n' +
            ' * v' + getVersion() + '\n\n*/';
    }

    function getVersion() {
        return grunt.file.readJSON('./bower.json').version;
    }

    grunt.initConfig({
        // condense javascript into a single file
        concat: {
            options: {
                banner: banner(),
                separator: '\n\n'
            },
            build: {
                files: {
                    'dist/user-module.js': [
                        'app/user.route.js',
                        'app/**/*.js'
                    ]
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('default', ['concat']);

};