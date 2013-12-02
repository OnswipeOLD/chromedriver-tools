var shell = require('shelljs');
var config = require('./config');
var debug = require('debug')('selenium-tools:install');
var async = require('async');

var noop = function(){};

module.exports = function install(cb) {
  debug('install');

  cb = cb || noop;

  shell.mkdir('-p',  config.tmpDir);
  var cwd = process.cwd();
  process.chdir(config.tmpDir);

  async.series([
    function(callback) {
      downloadSelenium(null, callback);
    },
    function(callback) {
      downloadChromeDriver(null, callback);
    },
    function(callback) {
      unzipChromeDriver(null, callback);
    },
    function(callback) {
      shell.rm(config.chromeDriver.file);
      callback(null);
    }
  ], function(err) {
    process.chdir(cwd);
    cb(err);
  });
};

function downloadSelenium(err, cb) {
  debug('downloadSelenium');
  cb = cb || noop;

  if (err) {
    return cb(err);
  }

  var selenium = [
    '-O',
    config.selenium.file,
    config.selenium.url
  ].join(' ');

  wget(selenium, cb);
}

function downloadChromeDriver(err, cb) {
  debug('downloadChromeDriver');
  cb = cb || noop;

  if (err) {
    return cb(err);
  }

  var chromeDriver = [
    '-O',
    config.chromeDriver.file,
    config.chromeDriver.url
  ].join(' ');

  wget(chromeDriver, cb);
}

function unzipChromeDriver(err, cb) {
  debug('unzipChromeDriver');
  cb = cb || noop;

  if (err) {
    return cb(err);
  }

  shell.exec(
    'unzip ' + config.chromeDriver.file,
    {
      async: true,
      silent: true
    },
    function(code, output) {
      debug('unzipped', code);
      var err;
      if (code !== 0) {
         err = new Error('Could not unzip' + config.chromeDriver.file);
      }
      cb(err);
    }
  );
}

function wget(options, cb) {
  debug('wget %s', options);
    shell.exec(
    'wget ' + options,
    {
      async: true,
      silent: true
    },
    function(code, output) {
      debug('wget complete', code);
      var err = null;
      if (code !== 0) {
       err = new Error('Could not wget specified url');
       debug(err.message, options);
      }
      cb(err);
    }
  );
}