var Base    = require('mocha').reporters.Base,
    util    = require('util'),
    color   = Base.color;

function delayLoadi18n() {
	return require('../reporter/i18n');
}

function printFeature(feature) {
	var i18n = delayLoadi18n();

  var buffer = '';
  buffer += util.format('%s: %s (finished on thread: %s)\n', i18n.get('feature'), feature.title, feature.thread);

  feature.scenarios.forEach(function (scenario) {
    buffer += util.format('   %s: %s\n', i18n.get('scenario'), scenario.title);

    scenario.steps.forEach(function (step) {
      if (step.status == 'pass') {
        buffer += util.format(color('checkmark', '     %s'), Base.symbols.ok);
        if (step.speed == 'fast') {
          buffer += util.format(color('pass', ' %s \n'), step.title);
        } else {
          buffer += util.format(color('pass', ' %s '), step.title);
          buffer += util.format(color(step.speed, '(%dms)\n'), step.duration);
        }
      } else if (step.status == 'fail') {
        buffer += util.format(color('fail', '     X %s\n'), step.title);
        buffer += color('fail', step.error + '\n');
      } else if (step.status == 'pending') {
        buffer += util.format(color('pending', '     - %s\n'), step.title);
      } else if (step.status === 'skipped') {
        buffer += util.format(color('medium', '     - %s\n'), step.title);
      }
    });
  });
  console.log(buffer);
}

function featureError(error) {
  console.log(error);
}

function testComplete(data) {
  if(!data) { 
    return;
  }
  
  var stats = data.stats;
  var i18n = delayLoadi18n();

  var status = stats.failures > 0 ? i18n.get('failed') : i18n.get('passed');
  var msg = "Moonraker tests %s!\n%s:%d\n%s:%d\n%s:%d\n%s:%d";
  console.log(util.format(msg, status, i18n.get('passed'), stats.passes, i18n.get('failed'),
    stats.failures, i18n.get('skipped'), stats.skipped, i18n.get('duration'), stats.duration));
}

module.exports = function(eventEmitter, config) {
  eventEmitter.on('featureFinished', printFeature);
  eventEmitter.on('featureError', featureError);
  eventEmitter.on('exit', testComplete);
};
