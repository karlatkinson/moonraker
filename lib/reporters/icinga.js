var Base    = require('mocha').reporters.Base,
    util    = require('util');

function testComplete(data) {
  if(!data) { 
    return;
  }
  
  var stats = data.stats;
  var status = stats.failures > 0 ? 'CRITICAL' : 'OK';
  var serviceMsg = util.format("MOONRAKER %s - OK: %d, Critical: %d, Warning: %d", status,
    stats.passes, stats.failures, stats.skipped);

  var perfMsg = util.format("passed=%d; failed=%d; skipped=%d; total=%d; time=%d", stats.passes,
    stats.failures, stats.skipped, stats.passes + stats.failures + stats.skipped, stats.duration);

  console.log(util.format("%s | %s", serviceMsg, perfMsg));
}

module.exports = function(eventEmitter, config) {
  eventEmitter.on('exit', testComplete);
};
