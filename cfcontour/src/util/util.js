'use strict';

// helpers

(function (CF) {
  CF.sleep = function (ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };
})(window.CFContour = window.CFContour || {});