var EventEmitter = require('events');
var eventEmitter = new EventEmitter();
var fs = require('fs');
var path = require('path');
var glob = require('glob');
var config;

function mergeResults(pattern) {
  var stats = {
    passes: 0,
    failures: 0,
    skipped: 0,
    duration: 0,
    threads: config.threads
  };
  var features = [];
  var durations = [];

  glob.sync(pattern).forEach(function (file) {
    thread = JSON.parse(fs.readFileSync(file));
    stats.passes += (thread.stats.passes - thread.stats.skipped);
    stats.failures += thread.stats.failures;
    stats.skipped += thread.stats.skipped;
    durations.push(thread.stats.duration);

    thread.features.forEach(function (feature) {
      features.push(feature);
    });
    features = sortByFeature(features);
    fs.unlinkSync(file);
  });
  stats.duration = Math.max.apply(Math, durations) / 1000;
  return { stats: stats, features: features };
}

function sortByFeature(features) {
  return features.sort(function (a, b) {
    a = a.title.toLowerCase();
    b = b.title.toLowerCase();
    return a < b ? -1 : a > b ? 1 : 0;
  });
}

module.exports = {
	setup: function(theConfig) {
		config = theConfig;

		if(!config.reporters) {
			return;
		}

		config.reporters.forEach(function(reporter) {
			if(typeof reporter === 'string') {
				reporter = { type: reporter };
			}

			new require('./' + reporter.type)(eventEmitter, reporter);
		});
	},
	emit: function() {
		if(arguments[0] === 'exit') {
			var builder = require('../reporter/builder');
		  var resultsDir = config.resultsDir || 'results';
		  var data = mergeResults(path.join(resultsDir, '*.json'));

		  eventEmitter.emit(arguments[0], data);
		}
		eventEmitter.emit.apply(eventEmitter, Array.prototype.slice.call(arguments));
	}
};
