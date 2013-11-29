/*jshint expr:true */
require('./helper.setup');
var debug = require('debug')('test:selenium-tools');
var tools = require('../index');
var shell = require('shelljs');
var wd = require('wd');

var tmpDir = __dirname + '/../tmp';
var browser;
var server;
var deathEvents = ['SIGTERM', 'SIGINT', 'SIGHUP'];

describe('Selenium Tools', function() {
  it('should exist', function() {
    expect(tools).to.exist;
  });

  describe('Install', function() {
    this.timeout(1000 * 60);

    before(cleanup);
    after(cleanup);

    it('should exist', function() {
      expect(tools).to.respondTo('install');
    });

    it('should download selenium jar to tmp directory', function(done) {
      tools.install(function() {
        expect(shell.test('-f', tmpDir + '/selenium.jar')).to.be.true;
        cleanup(done);
      });
    });

    it('should download and unzip Chrome Driver', function(done) {
      tools.install(function() {
        expect(shell.test('-f', tmpDir + '/chromedriver')).to.be.true;
        expect(shell.test('-f', tmpDir + '/chrome_driver.zip')).to.be.false;
        cleanup(done);
      });
    });
  });

  describe('Check', function() {
    before(cleanup);
    after(cleanup);

    it('should exist', function() {
      expect(tools).to.respondTo('check');
    });

    it('should return false if Selenium and Chrome are not installed', function() {
      expect(tools.check()).to.be.false;
    });

    it('should be true if Selenium and Chrome Driver are installed', function(done) {
      tools.install(function() {
        expect(tools.check()).to.be.true;
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
    });

    after(function() {
      stopServer();
      cleanup();
    });

    it('should exist', function() {
      expect(tools).to.respondTo('start');
    });

    it('should error if selenium server is not installed', function() {
      tools.start(function(err) {
        expect(err).to.be.an.instanceOf(Error);
        expect(err).to.have.property('message', 'Please install Selenium server and Chrome driver first');
      });
    });

    it('should start selenium with chromeDriver', function(done) {
      this.timeout(1000 * 60 * 2);
      tools.install(function() {
        expect(tools.check()).to.be.true;
        server = tools.start();
        server.once('ready', function() {
          browser.init({browserName: 'chrome'}, function(err) {
            expect(err).to.not.exist;
            browser.quit(done);
            browser = undefined;
          });
        });
      });
    });

    it('should error if already running', function(done) {
      otherServer = tools.start();
      otherServer.once('error', function(err) {
        expect(err).to.exist;
        expect(err).to.be.an.instanceOf(Error);
        expect(err).to.have.property('message', 'Selenium is already running');
        done();
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

function stopServer() {
  server && server.kill();
  browser && browser.quit();
  deathEvents.forEach(function(signal) {
    process.removeListener(signal, stopServer);
  });
}
