var shell = require('shelljs');
var system;

var config = module.exports = {
  system: system,
  tmpDir: __dirname + '/../tmp',
  selenium: {
    url: 'http://127.0.0.1/srv/selenium-server-standalone-2.37.0.jar',
    file: 'selenium.jar'
  },
  chromeDriver: {
    url: getChromeDriverDownloadUrl(),
    file: 'chrome_driver.zip'
  }
};

function getChromeDriverDownloadUrl() {
  var CHROMEDRIVER_LINUX_URL='http://chromedriver.storage.googleapis.com/2.7/chromedriver_linux32.zip';
  // var CHROMEDRIVER_MAC_URL='http://chromedriver.storage.googleapis.com/2.7/chromedriver_mac32.zip';
  var CHROMEDRIVER_MAC_URL='http://127.0.0.1/srv/chromedriver_mac32.zip';

  system = system || shell.exec('uname', {silent: true}).output.trim();
  if (system === 'Darwin') {
    return CHROMEDRIVER_MAC_URL;
  }
  return CHROMEDRIVER_LINUX_URL;
}
