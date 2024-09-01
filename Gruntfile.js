module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-screeps');

    grunt.initConfig({
        screeps: {
            options: {
                
                server: {
                    host: '127.0.0.1',
                    port: 21025,
                    http: true
                },
                email: 'abcdef@a.com',
                password:'Olek718320',
                branch: 'default',
                ptr: false
            },
            dist: {
                src: ['src_code/*.js']
            }
        }
    });
}
