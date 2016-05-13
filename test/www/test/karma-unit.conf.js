module.exports = function(config) {
  var js_b_dir = process.env["JS_B_DIR"];
  config.set({
    basePath: '../',
    frameworks: ['jasmine'],
    reporters: ['progress', 'junit', 'coverage'],
    browsers: ['Chrome'],
    autoWatch: true,
    singleRun: true,
    colors: true,

    files: [
      'js/jsup.js',
      //Test-Specific Code
      'test/unit/**/*.js'
    ],
    preprocessors: {
      'js/jsup.js': 'coverage'
    },
    // the default configuration
    coverageReporter: {
      type: 'json',
      dir: js_b_dir + '/uni/'
    },
    junitReporter: {
      outputFile: js_b_dir + '/junit-test-results.xml',
      suite: ''
    }
  });
};