var session     = require('./env/session'),
    Page        = require('./page-object/page'),
    Component   = require('./page-object/component'),
    reporters   = require('./reporters'),
    nconf       = require('nconf');

nconf.argv().env().file('config.json');

var config = nconf.get();

reporters.setup(config);

exports = module.exports = {
  config:    config,
  reporters: reporters,
  session:   session,
  Page:      Page,
  Component: Component
};
