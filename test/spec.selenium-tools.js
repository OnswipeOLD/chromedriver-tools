require('./helper.setup');
var debug = require('debug')('test:selenium-tools');
var tools = require('../index');
var shell = require('shelljs');

var tmpDir = __dirname + '/../tmp';
var otherDir = __dirname + '/../selenium';

describe('Selenium Tools', function() {
  it('should exist', function() {
    expect(tools).to.exist;
  });

  describe('Install', function() {
    this.timeout(1000 * 60);

    before(cleanUp);
    after(cleanUp);

    it('should exist', function() {
      expect(tools).to.respondTo('install');
    });

    it('should download selenium jar to default directory', function(done) {
      tools.install(function() {
        expect(shell.test('-f', tmpDir + '/selenium.jar')).to.be.true;
        done();
      });
    });

    it('should download selenium jar to specified directory', function(done) {
      tools.install(otherDir, function() {
        expect(shell.test('-f', otherDir + '/selenium.jar')).to.be.true;
        done();
      });
    });

    it('should download and unzip Chrome Driver', function(done) {
      tools.install(function() {
        expect(shell.test('-f', tmpDir + '/chromedriver')).to.be.true;
        expect(shell.test('-f', tmpDir + '/chrome_driver.zip')).to.be.false;
        done();
      });
    });
  });
});

function cleanUp() {
  shell.rm('-Rf', [tmpDir, otherDir]);
}