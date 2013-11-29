require('./helper.setup');
var debug = require('debug')('test:selenium-tools');
var tools = require('../index');
var shell = require('shelljs');

var tmpDir = __dirname + '/../tmp';

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

});

function cleanup(cb) {
  shell.rm('-Rf', [tmpDir]);
  if (cb) {
    cb();
  }
}