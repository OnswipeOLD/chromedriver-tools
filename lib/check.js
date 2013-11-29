var shell = require('shelljs');
var debug = require('debug')('selenium-tools:check');
var config = require('./config');

module.exports = function check() {
  debug('check');
  var selenium = shell.test('-f', config.tmpDir + '/selenium.jar');
  var chromeDriver = shell.test('-f', config.tmpDir + '/chromedriver');
  return selenium && chromeDriver;
};