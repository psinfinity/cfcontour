'use strict';

// rating -> color

(function (CF) {
  CF.rankColor = function (rating) {
    if (rating == null) return '#9aa0a6'; // unrated
    if (rating < 1200) return '#808080'; // Newbie
    if (rating < 1400) return '#008000'; // Pupil
    if (rating < 1600) return '#03a89c'; // Specialist
    if (rating < 1900) return '#0000ff'; // Expert
    if (rating < 2100) return '#aa00aa'; // CM
    if (rating < 2300) return '#ff8c00'; // Master
    if (rating < 2400) return '#ff8c00'; // IM
    if (rating < 2600) return '#ff0000'; // GM
    if (rating < 3000) return '#ff0000'; // IGM
    return '#000000'; // LGM
  };
})(window.CFContour = window.CFContour || {});