var fs         = require('fs'),
    path       = require('path'),
    glob       = require('glob'),
    Handlebars = require('handlebars'),
    wrench     = require('wrench'),
    util       = require('util'),
    resultsDir,
    reporterPath;

function testComplete(data) {
  if(!data) {
  	return;
  }

  var config = require('moonraker').config;
  var i18n = require('../reporter/i18n');

  Handlebars.registerHelper('ifEqual', function(a, b, options) {
    if( a != b ) {
      return options.inverse(this);
    } else {
      return options.fn(this);
    }
  });

  Handlebars.registerHelper('i18n', function (str) {
    return i18n.get(str);
  });

  reporterPath = path.join('node_modules', 'moonraker', 'lib', 'reporter');

  resultsDir = config.resultsDir || 'results';
  var source = fs.readFileSync(path.join(reporterPath, 'template.html'));
  var template = Handlebars.compile(source.toString());
  var result = template(data);

  copyAssets();
  var jqueryPath = path.join('node_modules', 'node_modules', 'jquery', 'dist','jquery.min.js');
  fs.linkSync(jqueryPath, path.join(resultsDir, 'assets', 'jquery.min.js'));

  fs.writeFileSync(path.join(resultsDir, 'index.html'), result);
}

function copyAssets() {
  var source = path.join(reporterPath, 'assets');
  var dest   = path.join(resultsDir, 'assets');
  wrench.copyDirSyncRecursive(source, dest);
}

module.exports = function(eventEmitter, config) {
  eventEmitter.on('exit', testComplete);
};
