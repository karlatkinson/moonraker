var EventEmitter = require('events');
var eventEmitter = new EventEmitter();

module.exports = {
	register: function(config) {
		if(typeof config === 'string') {
			config = { type: config };
		}

		new require('./' + config.type)(eventEmitter, config);
	},
	emit: function() {
		eventEmitter.emit.apply(eventEmitter, Array.prototype.slice.call(arguments));
	}
};
