var EventEmitter = require('events');
var eventEmitter = new EventEmitter();

var results = [];

module.exports = {
	setup: function(config) {
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
		eventEmitter.emit.apply(eventEmitter, Array.prototype.slice.call(arguments));
	}
};
