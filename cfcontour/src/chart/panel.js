'use strict';

// floating panel (shadow dom so styles don't clash)

(function (CF) {
  function createPanel() {
    const host = document.createElement('div');
    host.id = CF.HOST_ID;
    Object.assign(host.style, {
      position: 'fixed',
      right: '12px',
      bottom: '12px',
      zIndex: '2147483647',
    });

    const shadow = host.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        :host { all: initial; }
        .wrap { font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; width: 380px; max-width: calc(100vw - 24px); background: #fff; border: 1px solid #d0d7de; border-radius: 10px; box-shadow: 0 6px 20px rgba(0,0,0,.18); overflow: hidden; color: #111; }
        .header { display: flex; align-items: center; gap: 8px; padding: 8px 10px; cursor: pointer; user-select: none; background: #f6f8fa; border-bottom: 1px solid #e1e4e8; }
        .title { font-weight: 600; font-size: 13px; }
        .sub { font-size: 11px; color: #6b7280; }
        .spacer { flex: 1; }
        .btn { border: none; background: transparent; cursor: pointer; font-size: 14px; line-height: 1; padding: 4px 6px; border-radius: 6px; color: #444; }
        .btn:hover { background: #e6e9ed; }
        .body { padding: 8px 10px 6px; }
        .chart { width: 100%; height: 210px; display: none; }
        .footer { display: flex; justify-content: space-between; gap: 8px; font-size: 11px; color: #6b7280; padding: 6px 10px; border-top: 1px solid #eef0f2; }
        .loading { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #6b7280; padding: 20px 10px; }
        .spin { width: 14px; height: 14px; border: 2px solid #cbd5e1; border-top-color: #3b82f6; border-radius: 50%; animation: sp 0.8s linear infinite; }
        @keyframes sp { to { transform: rotate(360deg); } }
        .tip { position: fixed; pointer-events: none; background: rgba(17,24,39,.92); color: #fff; padding: 4px 6px; border-radius: 4px; font-size: 11px; white-space: nowrap; transform: translate(-50%, -130%); opacity: 0; transition: opacity .08s; }
        .controls { display: flex; align-items: center; gap: 6px; font-size: 11px; color: #6b7280; padding: 0 0 8px; }
        .filter { font-size: 11px; border: 1px solid #d0d7de; border-radius: 6px; padding: 2px 4px; background: #fff; color: #111; cursor: pointer; }
        .collapsed .body, .collapsed .footer { display: none; }
      </style>
      <div class="wrap">
        <div class="header">
          <span class="title">CF Contour</span>
          <span class="sub">avg score by rating</span>
          <span class="spacer"></span>
          <button class="btn collapse" title="Collapse">&#9662;</button>
        </div>
        <div class="body">
          <div class="controls">
            <span>Participants</span>
            <select class="filter" title="Participant filter">
              <option value="official">Official only</option>
              <option value="everyone">Everyone</option>
            </select>
          </div>
          <div class="loading"><span class="spin"></span><span>Loading standings&hellip;</span></div>
          <canvas class="chart"></canvas>
        </div>
        <div class="footer">
          <span class="stats"></span>
        </div>
        <div class="tip"></div>
      </div>
    `;
    document.body.appendChild(host);

    const $ = (selector) => shadow.querySelector(selector);
    return {
      host,
      shadow,
      wrap: $('.wrap'),
      header: $('.header'),
      body: $('.body'),
      chart: $('.chart'),
      tip: $('.tip'),
      stats: $('.stats'),
      collapseBtn: $('.collapse'),
      filter: $('.filter'),
      loading: $('.loading'),
    };
  }

  CF.createPanel = createPanel;
})(window.CFContour = window.CFContour || {});