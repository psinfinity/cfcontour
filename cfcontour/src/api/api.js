'use strict';

// cf api, called from the page so cloudflare is happy

(function (CF) {
  async function apiFetch(path, queryParamList) {
    const url = new URL(location.origin + CF.API_PATH + path);
    for (const [key, value] of queryParamList) {
      url.searchParams.append(key, value);
    }

    const resp = await fetch(url);
    const text = await resp.text();
    if (resp.status !== 200) {
      throw new Error(`CF API: HTTP error ${resp.status}: ${text}`);
    }

    let json;
    try {
      json = JSON.parse(text);
    } catch (_) {
      throw new Error(`CF API: Invalid JSON: ${text}`);
    }

    if (json.status !== 'OK' || json.result === undefined) {
      throw new Error(`CF API: Error: ${text}`);
    }
    return json.result;
  }

  // official rows + score
  function fetchStandings(contestId) {
    return apiFetch('contest.standings', [['contestId', contestId]]);
  }

  // standings don't have ratings, so look them up
  async function fetchRatings(handles) {
    const unique = [...new Set(handles.map((h) => String(h).toLowerCase()))];
    const map = new Map();

    for (let i = 0; i < unique.length; i += CF.RATING_BATCH_SIZE) {
      const batch = unique.slice(i, i + CF.RATING_BATCH_SIZE);

      let result;
      try {
        result = await apiFetch('user.info', [['handles', batch.join(';')]]);
      } catch (er) {
        console.warn('[cfcontour] rating batch failed:', er);
        continue;
      }

      for (const user of result) {
        if (user && user.handle) {
          const rating = (user.rating === undefined || user.rating === null) ? null : user.rating;
          map.set(String(user.handle).toLowerCase(), rating);
        }
      }

      if (i + CF.RATING_BATCH_SIZE < unique.length) {
        await CF.sleep(CF.RATING_BATCH_DELAY_MS);
      }
    }

    return map;
  }

  CF.apiFetch = apiFetch;
  CF.fetchStandings = fetchStandings;
  CF.fetchRatings = fetchRatings;
})(window.CFContour = window.CFContour || {});