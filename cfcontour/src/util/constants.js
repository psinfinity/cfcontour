'use strict';

// constants

(function (CF) {
  CF.API_PATH = '/api/';
  CF.REFRESH_INTERVAL_MS = 120 * 1000; // re-fetch live standings every 2 minutes
  CF.RATING_BATCH_SIZE = 500;
  CF.RATING_BATCH_DELAY_MS = 180;
  CF.HOST_ID = 'cfcontour-host';
})(window.CFContour = window.CFContour || {});