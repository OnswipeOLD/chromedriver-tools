/*jshint expr:true */
require('./helper.setup');
var debug = require('debug')('test:chromedriver-tools');
var tools = require('../index');
var shell = require('shelljs');
var wd = require('wd');
var async = require('async');

var tmpDir = __dirname + '/../tmp';
var browser;
var server;
var deathEvents = ['SIGTERM', 'SIGINT', 'SIGHUP'];

describe('Selenium Tools', function() {
  it('should exist', function() {
    expect(tools).to.exist;
  });

  before(cleanup);

  after(stopServer);

  describe('Install', function() {
    this.timeout(1000 * 60);

    before(tools.install);
    after(cleanup);

    it('should download selenium jar to tmp directory', function(done) {
      expect(shell.test('-f', tmpDir + '/selenium.jar')).to.be.true;
      done();
    });

    it('should download and unzip Chrome Driver', function(done) {
      expect(shell.test('-f', tmpDir + '/chromedriver')).to.be.true;
      expect(shell.test('-f', tmpDir + '/chrome_driver.zip')).to.be.false;
      done();
    });
  });

  describe('Check', function() {
    before(cleanup);
    after(stopServer);

    it('should exist', function() {
      expect(tools).to.respondTo('check');
    });

    it('should return false if Chromedriver and dependencies are not installed', function() {
      expect(tools.check('installed')).to.be.false;
    });

    it('should be true if Chromedriver and dependencies are installed', function(done) {
      tools.install(function() {
        expect(tools.check('installed')).to.be.true;
        done();
      });
    });

    it('should return false if Chromedriver is not running', function() {
      expect(tools.check('running')).to.be.false;
    });

    it('should return true if Chromedriver is running', function(done) {
      tools.server.start(null, function(err, chromedriver) {
        server = chromedriver;
        expect(tools.check('running')).to.be.true;
        done();
      });
    });
  });

  describe('Server', function() {
    before(function () {
      browser = wd.remote();
      deathEvents.forEach(function(signal) {
        process.on(signal, stopServer);
      });
      cleanup();
    });

    after(stopServer);

    it('should exist', function() {
      expect(tools).to.have.property('server');
    });

    describe('start', function() {
      it('should exist', function() {
        expect(tools.server).to.respondTo('start');
      });

      it('should install Selenium and Chromedriver if its not installed, before starting', function(done) {
        this.timeout(1000 * 10);
        expect(shell.test('-f', tmpDir + '/chromedriver')).to.be.false;
        expect(shell.test('-f', tmpDir + '/chrome_driver.zip')).to.be.false;
        debug('starting');
        tools.server.start(null, function(err, chromedriver) {
          debug('started');
          expect(err).to.not.exist;
          expect(shell.test('-f', tmpDir + '/selenium.jar')).to.be.true;
          expect(shell.test('-f', tmpDir + '/chromedriver')).to.be.true;
          expect(chromedriver).to.exist;
          server = chromedriver;
          stopServer(done);
        });
      });

      it('should start Selenium with Chromedriver', function(done) {
        this.timeout(1000 * 10);
        async.series([
          function(callback) {
            tools.server.start(null, function(err, chromedriver){
              expect(err).to.not.exist;
              server = chromedriver;
              callback(null);
            });
          },
          function(callback) {
            var options = {
              browserName: 'chrome'
            };

            browser.init(options, callback);
          },
          function(callback) {
            browser.get('http://google.com', callback);
          },
          function(callback) {
            browser.quit(callback);
            browser = undefined;
          }
        ],
        done);
      });

      it('should return itself if chromedriver is already running, and its the same instance', function(done) {
        tools.server.start(null, function(err, chromedriver2) {
          expect(err).to.not.exist;
          expect(chromedriver2).to.exist;
          expect(chromedriver2).to.respondTo('once');
          done();
        });
      });
    });

    describe('Stop', function () {
      after(cleanup);
      it('should exist', function() {
        expect(tools.server).to.respondTo('stop');
      });

      it('should stop selenium server', function(done) {
        var cmd = 'ps aux | grep -v grep | grep selenium.jar';
        var running = shell.exec(cmd, {silent:true}).output;
        expect(running.indexOf('selenium.jar') > -1).to.be.true;
        tools.server.stop(function() {
          running = shell.exec(cmd, {silent:true}).output;
          debug('should be stopped', running);
          expect(running.indexOf('selenium.jar') > -1).to.be.false;
          done();
        });
      });
    });
  });

});


function cleanup(cb) {
  shell.rm('-Rf', [tmpDir]);
  if (cb) {
    cb();
  }
}

function stopServer(cb) {
  browser && browser.quit();
  deathEvents.forEach(function(signal) {
    process.removeListener(signal, stopServer);
  });
  tools.server.stop(function() {
    debug('stopped', arguments);
    cb();
  });
}
