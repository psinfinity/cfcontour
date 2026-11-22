'use strict';

// the api hides unofficial people, so scrape the standings page for them

(function (CF) {
  function standingsPageUrl() {
    const base = location.pathname.replace(/\/standings(\/.*)?$/, '/standings');
    const url = new URL(location.origin + base);
    url.searchParams.set('showUnofficial', 'true');
    url.searchParams.set('rv', Math.random().toString(36).slice(2, 9));
    return url;
  }

  async function fetchStandingsDom() {
    const resp = await fetch(standingsPageUrl());
    if (!resp.ok) {
      throw new Error(`CF standings page: HTTP error ${resp.status}`);
    }
    return parseStandingsDom(await resp.text());
  }

  function parseStandingsDom(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const table = doc.querySelector('table.standings');
    if (!table) return [];

    // find the score column
    let scoreIndex = 2;
    const headerRow = table.querySelector('tr');
    if (headerRow) {
      const ths = Array.from(headerRow.querySelectorAll('th'));
      for (let i = 0; i < ths.length; i++) {
        const text = (ths[i].textContent || '').trim().toUpperCase();
        if (text === 'SCORE' || text === 'POINTS') { scoreIndex = i; break; }
        if (text === '=') scoreIndex = i;
      }
    }

    const rows = [];
    for (const tr of table.querySelectorAll('tr')) {
      const cell = tr.querySelector('td.contestant-cell');
      if (!cell) continue;

      const a = cell.querySelector('a[href^="/profile/"]');
      if (!a) continue;

      const handle = (a.textContent || '').trim();
      if (!handle) continue;

      const tds = Array.from(tr.children).filter((el) => el.tagName === 'TD');
      const scoreText = tds[scoreIndex] ? (tds[scoreIndex].textContent || '') : '';
      const parsed = parseFloat(scoreText.replace(/,/g, '').trim());
      const score = Number.isFinite(parsed) ? parsed : 0;

      rows.push({ handle, score });
    }
    return rows;
  }

  async function loadDomRows(apiRows) {
    const domRows = await fetchStandingsDom();

    const officialHandles = new Set(
      (apiRows || [])
        .map((r) => r.party && r.party.members && r.party.members[0] && r.party.members[0].handle)
        .filter(Boolean)
        .map((h) => String(h).toLowerCase())
    );

    for (const row of domRows) {
      row.official = officialHandles.has(String(row.handle).toLowerCase());
    }
    return domRows;
  }

  CF.loadDomRows = loadDomRows;
  CF.parseStandingsDom = parseStandingsDom;
})(window.CFContour = window.CFContour || {});