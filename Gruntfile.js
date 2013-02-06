module.exports = function(grunt) {
  grunt.initConfig({
    watch: {},
    mocha: {
      all: {
        src: "tests/run_tests.html",
        options: {
          run: true
        }
      }
    }
  })

  grunt.loadNpmTasks('grunt-mocha')
  grunt.task.registerTask('test', ['mocha'])
  grunt.task.registerTask('default', 'mocha')
}
