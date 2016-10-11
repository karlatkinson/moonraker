var config  = require('moonraker').config,
    session = require('moonraker').session,
    reporter = require('moonraker').reporter,
    Mocha   = require('mocha'),
    path    = require('path');

process.on('message', function (msg) {

  if (msg.mocha) {

    session.thread = msg.thread;
    session.queue = msg.queue;

    var mochaReporter = (config.reporter === 'moonraker') ? reporter : config.reporter;
    var mocha = new Mocha({
      reporter: mochaReporter,
      timeout: config.testTimeout || 60000,
      slow: config.slow || 10000
    });

    mocha.addFile(
      path.join('node_modules', 'moonraker', 'lib', 'env', 'yadda.js')
    );

    session.create();

    mocha.run(function (failures) {
      process.exit(failures);
    });
  }

});
