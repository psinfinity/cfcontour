'use strict';

// cf contour: avg score by rating on standings pages

(function (CF) {
  if (window.__cfcontourLoaded) return;
  window.__cfcontourLoaded = true;

  const state = {
    contestId: null,
    ratings: null, // Map<lowercase handle, rating|null> ; fetched lazily per filter
    apiRows: [], // official standings rows from contest.standings
    domRows: null, // parsed standings page rows: { handle, score, official }[]
    filter: 'official', // 'official' | 'everyone'
    loading: false,
    timer: null,
  };

  // rendering

  function render(panel, data) {
    panel.loading.style.display = 'none';
    panel._data = data;

    if (data.participants === 0) {
      data.emptyMessage = 'No participants match this filter';
    }

    if (!panel.wrap.classList.contains('collapsed')) {
      panel.chart.style.display = 'block';
      CF.drawChart(panel, data);
    }

    panel.stats.textContent = `${data.participants} participants`;
  }

  function renderPanel(panel) {
    render(panel, CF.compute(CF.rowsForFilter(state), state.ratings));
  }

  // data loading

  async function refresh(panel) {
    if (state.loading) return;
    state.loading = true;

    try {
      const standings = await CF.fetchStandings(state.contestId);
      state.apiRows = standings.rows || [];

      // unofficial folks come from the page, not the api
      if (state.filter !== 'official') {
        try {
          state.domRows = await CF.loadDomRows(state.apiRows);
        } catch (er) {
          console.warn('[cfcontour] standings page fetch failed:', er);
          state.domRows = [];
        }
      }

      const rows = CF.rowsForFilter(state);
      await CF.getRatings(state, rows.map((r) => r.handle));
      renderPanel(panel);
    } catch (er) {
      console.error('[cfcontour] refresh failed:', er);
      panel.loading.style.display = 'none';
      panel.stats.textContent = 'Failed to load standings';
    } finally {
      state.loading = false;
    }
  }

  async function onFilterChange(panel) {
    state.filter = panel.filter.value;
    if (state.apiRows.length === 0) return;

    state.loading = true;
    try {
      if (state.filter !== 'official') {
        try {
          state.domRows = await CF.loadDomRows(state.apiRows);
        } catch (er) {
          console.warn('[cfcontour] standings page fetch failed:', er);
          state.domRows = [];
        }
      }

      const rows = CF.rowsForFilter(state);
      await CF.getRatings(state, rows.map((r) => r.handle));
      renderPanel(panel);
    } catch (er) {
      console.error('[cfcontour] filter change failed:', er);
      panel.stats.textContent = 'Failed to load standings';
    } finally {
      state.loading = false;
    }
  }

  // bootstrap

  function toggleCollapse(panel) {
    const collapsed = panel.wrap.classList.toggle('collapsed');
    panel.collapseBtn.innerHTML = collapsed ? '&#9656;' : '&#9662;';

    if (!collapsed && panel._data) {
      panel.chart.style.display = 'block';
      CF.drawChart(panel, panel._data);
    }
  }

  function main() {
    const matches = location.pathname.match(/contest\/(\d+)\/standings/);
    if (!matches) return;
    if (!document.body) {
      setTimeout(main, 200);
      return;
    }

    const panel = CF.createPanel();

    panel.collapseBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleCollapse(panel);
    });

    panel.header.addEventListener('click', (event) => {
      if (event.target.closest('button')) return;
      toggleCollapse(panel);
    });

    panel.filter.addEventListener('change', () => onFilterChange(panel));
    panel.chart.addEventListener('mousemove', (event) => CF.handleChartMove(panel, event));
    panel.chart.addEventListener('mouseleave', () => { panel.tip.style.opacity = '0'; });

    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (!panel.wrap.classList.contains('collapsed') && panel._data) {
          CF.drawChart(panel, panel._data);
        }
      }, 150);
    });

    state.contestId = matches[1];
    refresh(panel);

    // keep it fresh
    state.timer = setInterval(() => {
      if (document.visibilityState === 'visible') {
        refresh(panel);
      }
    }, CF.REFRESH_INTERVAL_MS);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
  } else {
    main();
  }
})(window.CFContour = window.CFContour || {});