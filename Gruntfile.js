module.exports = function(grunt) {

    function banner(a) {
        return '/*\n' +
            ' * User Module\n' +
            ' * https://github.com/mr-nilesh/user-module\n' +
            ' * v' + getVersion() + '\n\n*/\n';
    }

    function getVersion() {
        return grunt.file.readJSON('./bower.json').version;
    }

    grunt.initConfig({
        // condense javascript into a single file
        concat: {
            options: {
                banner: banner(),
                process: function(src, filepath) {
                    var replacedString = src.replace(/.\/styles\/user\.scss/g, './user-module.scss');
                    return replacedString.replace(/..\/..\/..\/common\/theme\/default\/variables\.scss/g, '../../../src/common/theme/default/variables.scss');
                }
            },
            build: {
                files: {
                    'dist/user-module.js': [
                        'app/user.route.js',
                        'app/**/*.js'
                    ],
                    'dist/user-module.scss': [
                        'app/styles/user.scss'
                    ]
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('default', ['concat']);

};