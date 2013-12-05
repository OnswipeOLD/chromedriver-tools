var noop = function() {};
var spawn = require('child_process').spawn;
var config = require('./config');
var check = require('./check');
var install = require('./install');
var debug = require('debug')('chromedriver-tools:server');
var log = require('debug')('log:chromedriver');

var chromedriver;
var serverStatus = 'off';
var deathEvents = ['SIGTERM', 'SIGINT', 'SIGHUP'];
var setupDeath = false;

module.exports.start = function start(err, cb) {
  debug('start', 'starting chromedriver server');
  cb = cb || noop;
  if (err) {
    return cb(err);
  }

  if (check('installed') === false) {
    debug('not installed, installing');
    return install(function(err) {
      start(err, cb);
    });
  }

  if (serverStatus === 'on' || serverStatus === 'ready') {
    debug('already started', serverStatus);
    return cb(null, chromedriver);
  } else if (check('running')) {
    debug('Selenium is already running on another process, please kill it :D');
    return cb(new Error('Selenium is already running on another process'));
  }

  debug('here', serverStatus);

  var startTime = Date.now();
  serverStatus = 'on';

  chromedriver = spawn(
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

  chromedriver.stdout.setEncoding('utf8');
  chromedriver.stdout.on('data', function(data) {
    log('stdout: ', data);
    if (data.indexOf('Started org.openqa.jetty.jetty.Server') > -1) {
      debug('server ready in %s s', (Date.now() - startTime)/1000);
      serverStatus = 'ready';
      cb(null, chromedriver);
    }
  });

  chromedriver.stderr.setEncoding('utf8');
  chromedriver.stderr.on('data', function(data) {
    debug('stderr: ', data);
    var runningMessage = 'chromedriver is already running on port 4444. Or some other service is';
    if (data.indexOf(runningMessage) > -1) {
      chromedriver.emit('error', new Error(runningMessage));
      chromedriver.exit();
    }
  });

  chromedriver.on('close', function() {
    debug('x_X good bye cruel world X_x');
    serverStatus = 'off';
    removeDeathEvents();
  });
};

var stop = module.exports.stop = function stop(cb) {
  debug('stop', 'stopping chromedriver server');
  cb = cb || noop;
  if (chromedriver)  {
    chromedriver.once('close', cb);
    chromedriver.kill();
    chromedriver = null;
  } else {
    cb();
  }
  removeDeathEvents();
};

function removeDeathEvents() {
  serverStatus = 'off';
  deathEvents.forEach(function(signal) {
    process.removeListener(signal, stop);
  });
}
