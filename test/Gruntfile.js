module.exports = function(grunt) {
  // var go_b_dir = process.env["GO_B_DIR"];
  var js_b_idr = process.env["JS_B_DIR"];
  var ws_b_dir = process.env["WS_B_DIR"];
  //
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-srv');
  grunt.initConfig({
    srv: {
      wdm: {
        options: {
          ctrlc: true,
          wait: 1000
        },
        cmd: 'webdriver-manager start'
      },
      igsrv: {
        options: {
          stdout: true,
          wait: 2000,
          stopf: function(exec) {
            grunt.SrvWebKill("http://localhost:7899/jsup/exit");
          },
          cwd: ws_b_dir
        },
        ucmd: 'bin/srv.test -test.v --test.coverprofile=../go/ig.out',
        wcmd: '.\\bin\\srv.test.exe -test.v --test.coverprofile=..\\go\\ig.out'
      },
      mnsrv: {
        options: {
          stdout: true,
          wait: 2000,
          kill: "SIGINT",
          cwd: ws_b_dir
        },
        ucmd: 'bin/jsup',
        wcmd: 'bin/jsup.exe'
      },
      jcr: {
        options: {
          stdout: true,
          wait: 1000,
          stopf: function(exec) {
            grunt.SrvWebKill("http://localhost:5457/jcr/exit");
          }
        },
        cmd: 'jcr start -o ' + js_b_idr + "/e2e"
      }
    },
    shell: {
      uni: {
        command: "karma start www/test/karma-unit.conf.js"
      },
      e2e: {
        command: "protractor www/test/protractor-conf.js"
      }
    }
  });
  grunt.registerTask('r_uni', ['shell:uni']);
  grunt.registerTask('r_e2e', ['shell:e2e']);
  grunt.registerTask('r_srv', ['srv:wdm', 'srv:igsrv', 'srv:jcr']);
  grunt.registerTask('d_srv', ['srv:wdm', 'srv:mnsrv', 'srv:jcr']);
  grunt.registerTask('w_srv', ['srv:wdm', 'srv:mnsrv', 'srv:jcr', 'srv-wait']);
  grunt.registerTask('g_e2e', ['r_srv', 'r_e2e', 'srv-stop']);
  grunt.registerTask('d_e2e', ['d_srv', 'r_e2e', 'srv-stop']);
  grunt.registerTask('d_web', ['d_e2e']);
  grunt.registerTask('default', ['g_e2e']);
};