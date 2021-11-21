/*
  Version: 0.0.3-alpha
  SVGAnimFrames, copyright (c) by Michael Schwartz
  Distributed under an MIT license: https://github.com/michaelsboost/SVGAnimFrames/blob/gh-pages/LICENSE
  
  This is SVGAnimFrames (https://michaelsboost.github.io/SVGAnimFrames/), SVG Frame By Frame Animation
*/

// call SVG Frame by Frame animation
// SVGAnimFrames("#bounce svg", "> g > g", "repeat", "40", "0");

function SVGAnimFrames(elm, tobefound, repeat, frametime, delay) {
  var counter = 0;
  
  // grab animation frames
  var detectFrame = parseInt(document.querySelectorAll(elm + ' ' + tobefound).length);
  var totalFrames = parseInt(document.querySelectorAll(elm + ' ' + tobefound).length);
  
  // kill animation
  function killAnim() {
    counter = 0;
    detectFrame = 0;
    clearInterval(window.intervalID);
  }
  
  // restart timer
  function restartSVGAnim() {
    killAnim();
    intervalID = setInterval(animateSVGFrames, frametime);
  }
  
  // SVG Frame by Frame animation
  function animateSVGFrames() {
    // frame counter
    var detectFrame = counter++;

    // remove the vector-effect attribute
    for (var i = 0; i < document.querySelectorAll(elm + " > g > g *").length; i++) {
      document.querySelectorAll(elm + " *")[i].removeAttribute("vector-effect");
    }

    // only show active frame
    for (var i = 0; i < totalFrames; i++) {
      if (counter > totalFrames) {
        return false;
      }
      document.querySelectorAll(elm + ' ' + tobefound)[i].style.display = "none";
      document.querySelectorAll(elm + ' ' + tobefound)[detectFrame].style.display = "block";
    }

    // detect end of animation
    if (repeat === "no-repeat") {
      // if user states no-repeat
      if (counter === totalFrames) {
        // end of animation
        for (var i = 0; i < totalFrames; i++) {
          if (counter > totalFrames) {
            clearInterval(window.intervalID);
            counter = 0;
            var detectFrame = totalFrames;
            return false;
          }
          document.querySelectorAll(elm + ' ' + tobefound)[i].style.display = "none";
          document.querySelectorAll(elm + ' ' + tobefound)[detectFrame].style.display = "block";
        }
      }
    } else {
      // if user states repeat or other
      if (counter === totalFrames) {
        // end of animation
        setTimeout(function() {
          restartSVGAnim();
        }, delay);
      } else if (detectFrame >= totalFrames) {
        // restart animation
        setTimeout(function() {
          restartSVGAnim();
        }, delay);
      }
    }
  }

  // initiate SVG Frame by Frame animation
  window.intervalID = setInterval(animateSVGFrames, frametime);
  return false;
};