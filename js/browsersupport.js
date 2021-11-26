/*
  Version: 1.000-alpha
  TouchDrawer, copyright (c) by Michael Schwartz
  Distributed under an MIT license: https://github.com/michaelsboost/TouchDrawer/blob/gh-pages/LICENSE
  
  This is TouchDrawer (https://michaelsboost.github.io/TouchDrawer/), Just a free and open source vector drawing tool for mobile.
*/

// Detect browser support onload
function unsupportedBrowser() {
  alertify.error("Error: You are using an unsupported browser!");
  setTimeout(function() {
    alertify.log('We recommend using the most recent version of <a href="https://www.google.com/chrome/" target="_blank">Google Chrome</a>');
  }, 2000);
}
if (bowser.msie && bowser.version <= 6) {
  // hello ie
  unsupportedBrowser();
} else if (bowser.firefox) {
  // hello firefox
  unsupportedBrowser();
} else if (bowser.chrome) {
  // hello chrome
} else if (bowser.safari) {
  // hello safari
  unsupportedBrowser();
} else if(bowser.iphone || bowser.android) {
  // hello mobile
  unsupportedBrowser();
}