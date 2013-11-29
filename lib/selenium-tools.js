var shell = require('shelljs');
var debug = require('debug')('selenium-tools');
var http = require('http');
var async = require('async');

var noop = function(){};
var system;
var tmpDir = __dirname + '/../tmp';
var SELENIUM_DOWNLOAD_URL = 'http://127.0.0.1/selenium-server-standalone-2.37.0.jar';
var SELENIUM_FILE_NAME = 'selenium.jar';
var CHROMEDRIVER_LINUX_URL='http://chromedriver.storage.googleapis.com/2.7/chromedriver_linux32.zip';
// var CHROMEDRIVER_MAC_URL='http://chromedriver.storage.googleapis.com/2.7/chromedriver_mac32.zip';
var CHROMEDRIVER_MAC_URL='http://127.0.0.1/chromedriver_mac32.zip';
var CHROMEDRIVER_FILE_NAME = 'chrome_driver.zip';

module.exports.install = function(dir, cb) {
  debug('install');

  if (dir && typeof dir === 'function') {
    cb = dir;
    dir = tmpDir;
  }

  cb = cb || noop;

  shell.mkdir('-p',  dir);
  process.chdir(dir);

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
      shell.rm(CHROMEDRIVER_FILE_NAME);
      callback(null);
    }
  ], function(err) {
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
    SELENIUM_FILE_NAME,
    SELENIUM_DOWNLOAD_URL
  ].join(' ');

  wget(selenium, cb);
}

function getChromeDriverDownloadUrl() {
  system = system || shell.exec('uname').output.trim();
  if (system === 'Darwin') {
    return CHROMEDRIVER_MAC_URL;
  }
  return CHROMEDRIVER_LINUX_URL;
}

function downloadChromeDriver(err, cb) {
  debug('downloadChromeDriver');
  cb = cb || noop;

  if (err) {
    return cb(err);
  }

  var chromeDriver = [
    '-O',
    CHROMEDRIVER_FILE_NAME,
    getChromeDriverDownloadUrl()
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
    'unzip ' + CHROMEDRIVER_FILE_NAME,
    function(code, output) {
      debug('unzipped', code);
      var err;
      if (code !== 0) {
         err = new Error('Could not unzip' + CHROMEDRIVER_FILE_NAME);
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
      }
      cb(err);
    }
  );
}