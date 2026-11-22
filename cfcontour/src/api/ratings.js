'use strict';

// ratings don't change mid-contest, so fetch once and reuse

(function (CF) {
  async function getRatings(state, handles) {
    if (state.ratings === null) {
      state.ratings = new Map();
    }

    const wanted = [...new Set(handles.map((h) => String(h).toLowerCase()))];
    const missing = wanted.filter((h) => !state.ratings.has(h));
    if (missing.length === 0) return;

    const fetched = await CF.fetchRatings(missing);
    for (const [handle, rating] of fetched) {
      state.ratings.set(handle, rating);
    }
  }

  CF.getRatings = getRatings;
})(window.CFContour = window.CFContour || {});