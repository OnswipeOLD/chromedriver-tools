var shell = require('shelljs');
var debug = require('debug')('chromedriver-tools:check');
var config = require('./config');

module.exports = function check(status) {
  debug('checking %s', status);
  if (status === 'installed') {
    var selenium = shell.test('-f', config.tmpDir + '/selenium.jar');
    var chromeDriver = shell.test('-f', config.tmpDir + '/chromedriver');
    return selenium && chromeDriver;
  }

  if (status === 'running') {
    var cmd = 'ps aux | grep -v grep | grep ' + config.selenium.file;
    var running = shell.exec(cmd, {silent:true}).output;
    if (running.indexOf(config.selenium.file) > -1) {
      return true;
    }
    return false;
  }

};