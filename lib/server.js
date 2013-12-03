var noop = function() {};
var spawn = require('child_process').spawn;
var config = require('./config');
var checkInstallation = require('./check');
var debug = require('debug')('selenium-tools:start');
var log = require('debug')('log:selenium-server');

var selenium;
var serverStatus = 'off';
var deathEvents = ['SIGTERM', 'SIGINT', 'SIGHUP'];
var setupDeath = false;

module.exports.start = function start(cb) {
  debug('start', 'starting selenium server');
  cb = cb || noop;

  if (checkInstallation() === false) {
    return cb(new Error('Please install Selenium server and Chrome driver first'));
  }

  if (isAlreadyRunning()) {
    process.nextTick(function() {
      selenium.emit('error', new Error('Selenium is already running'));
    });
    return selenium;
  }

  var startTime = Date.now();
  serverStatus = 'on';

  selenium = spawn(
    'java',
    [
      '-jar',
      'selenium.jar',
      '-Dwebdriver.chrome.driver=./chromedriver'
    ],
    {
      cwd: config.tmpDir
    }
  );

  deathEvents.forEach(function (signal) {
    process.on(signal, stop);
  });

  selenium.stdout.setEncoding('utf8');
  selenium.stdout.on('data', function(data) {
    log('stdout: ', data);
    if (data.indexOf('Started org.openqa.jetty.jetty.Server') > -1) {
      debug('server ready in %s s', (Date.now() - startTime)/1000);
      serverStatus = 'ready';
      selenium.emit('ready');
      cb(null);
    }
  });

  selenium.stderr.setEncoding('utf8');
  selenium.stderr.on('data', function(data) {
    debug('stderr: ', data);
    var runningMessage = 'Selenium is already running on port 4444. Or some other service is';
    if (data.indexOf(runningMessage) > -1) {
      selenium.emit('error', new Error(runningMessage));
      selenium.exit();
    }
  });

  selenium.on('close', function() {
    debug('close');
    removeDeathEvents();
  });

  return selenium;
};

var stop = module.exports.stop = function stop(cb) {
  debug('stop', 'stopping selenium server');
  cb = cb || noop;
  if (selenium)  {
    selenium.once('close', cb);
    selenium.kill();
    selenium = undefined;
  }

  removeDeathEvents();
};


function removeDeathEvents() {
  deathEvents.forEach(function(signal) {
    process.removeListener(signal, stop);
    serverStatus = 'off';
  });
}


function isAlreadyRunning() {
  if (serverStatus === 'on' || serverStatus === 'ready') {
    debug('already running');
    return true;
  }

  return false;
}