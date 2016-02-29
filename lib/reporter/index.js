var session = require('moonraker').session,
    config  = require('moonraker').config,
    reporters = require('moonraker').reporters,
    Base    = require('mocha').reporters.Base,
    i18n    = require('./i18n'),
    fs      = require('fs'),
    path    = require('path'),
    util    = require('util'),
    color   = Base.color;

exports = module.exports = Moonraker;

function Moonraker(runner) {

  Base.call(this, runner);

  var jsonOut  = path.join(config.resultsDir || 'results', process.pid.toString() + '.json');
  var result   = { features: session.queue };
  var feature  = null;
  var scenario = null;
  var level    = 0;

  this.stats.skipped = 0;

  runner.on('end', function () {
    result.stats = this.stats;
    fs.writeFileSync(jsonOut, JSON.stringify(result));
  });

  runner.on('suite', function (suite) {
    if (suite.root) return;
    if (!feature) {
      feature = {
        title: suite.title,
        thread: session.thread,
        scenarios: []
      };
    } else {
      scenario = {
        title: suite.title,
        steps: []
      };
      level++;
    }
  });

  runner.on('suite end', function (suite) {
    if (suite.root) return;
    if (level === 0) {
      finishFeature(result, feature);
      reporters.emit('featureFinished', feature);
      feature = null;
    } else {
      feature.scenarios.push(scenario);
      scenario = null;
      level--;
    }
  });

  runner.on('pass', function (test) {
    var step = {
      title: test.title,
      speed: test.speed,
      duration: test.duration
    };
    if (scenario.status === 'fail') {
      step.status = 'skipped';
      this.stats.skipped++;
    } else {
      step.status = 'pass';
      scenario.status = 'pass';
    }
    scenario.steps.push(step);
  });

  runner.on('pending', function (test) {
    scenario.steps.push({
      title: test.title,
      status: 'pending'
    });
    scenario.status = 'pending';
  });

  runner.on('fail', function (test) {
    var errorStr = test.err.stack || test.err.toString();
    if (!~errorStr.indexOf(test.err.message)) {
       errorStr = test.err.message + '\n' + errorStr;
    }
    if (!test.err.stack && test.err.sourceURL && test.err.line !== undefined) {
       errorStr += "\n(" + test.err.sourceURL + ":" + test.err.line + ")";
    }
    var screenshotPath;
    if (session.getDriver() !== null) {
      screenshotPath = test.title.replace(/\W+/g, '-').toLowerCase() + '.png';
    }
    if (!feature) {
      reporters.emit('featureError', errorStr);
    }
    if (scenario) {
      scenario.steps.push({
        title: test.title,
        status: 'fail',
        speed: test.speed,
        duration: test.duration,
        error: errorStr,
        screenshot: screenshotPath
      });
      scenario.status = 'fail';
    }
  });
}

function finishFeature(result, feature) {
  result.features.forEach(function (f) {
    if (f.title === feature.title) {
      for (var attr in feature) { f[attr] = feature[attr]; }
    }
  });
}
