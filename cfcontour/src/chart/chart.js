'use strict';

// chart ui

(function (CF) {
  function drawChart(panel, data) {
    const canvas = panel.chart;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = Math.max(1, rect.width);
    const h = Math.max(1, rect.height);

    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);

    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const buckets = data.buckets;
    const margin = { top: 16, right: 12, bottom: 32, left: 42 };
    const plotW = w - margin.left - margin.right;
    const plotH = h - margin.top - margin.bottom;

    if (!buckets.length) {
      ctx.fillStyle = '#9aa0a6';
      ctx.font = '12px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(data.emptyMessage || 'No rated participants yet', w / 2, h / 2);
      panel._hit = [];
      return;
    }

    const lows = buckets.map((b) => b.low);
    let xMin = Math.min(...lows);
    let xMax = Math.max(...lows);
    if (xMin === xMax) {
      xMin -= 50;
      xMax += 50;
    }

    const maxAvg = Math.max(1, ...buckets.map((b) => b.avg));
    const yMax = Math.max(1, Math.ceil(maxAvg));

    const x = (v) => margin.left + ((v - xMin) / (xMax - xMin)) * plotW;
    const y = (v) => margin.top + plotH - (v / yMax) * plotH;

    // grid + y labels
    ctx.font = '11px system-ui, sans-serif';
    ctx.lineWidth = 1;
    const yStep = Math.max(1, Math.ceil(yMax / 4));
    for (let t = 0; t <= yMax; t += yStep) {
      const yy = y(t);
      ctx.strokeStyle = '#e6e9ed';
      ctx.beginPath();
      ctx.moveTo(margin.left, yy);
      ctx.lineTo(margin.left + plotW, yy);
      ctx.stroke();

      ctx.fillStyle = '#6b7280';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(t), margin.left - 6, yy);
    }

    // y label
    ctx.fillStyle = '#9aa0a6';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('avg score', 4, 2);

    // x labels (sampled)
    const n = buckets.length;
    const labelEvery = n <= 10 ? 1 : Math.ceil(n / 10);
    ctx.fillStyle = '#6b7280';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let i = 0; i < n; i += labelEvery) {
      const b = buckets[i];
      ctx.fillText(String(b.low), x(b.low), margin.top + plotH + 6);
    }
    ctx.fillText('rating', margin.left + plotW / 2, margin.top + plotH + 18);

    // connect the dots
    if (buckets.length > 1) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      buckets.forEach((b, i) => {
        const px = x(b.low);
        const py = y(b.avg);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
    }

    // dots, colored by rank
    const hit = [];
    for (const b of buckets) {
      const px = x(b.low);
      const py = y(b.avg);

      ctx.beginPath();
      ctx.arc(px, py, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = CF.rankColor(b.low);
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#fff';
      ctx.stroke();

      hit.push({ px, py, bucket: b });
    }

    panel._hit = hit;
    panel._cssW = w;
    panel._cssH = h;
  }

  function handleChartMove(panel, event) {
    const hit = panel._hit;
    if (!hit || !hit.length) return;

    const rect = panel.chart.getBoundingClientRect();
    const mx = event.clientX - rect.left;
    const my = event.clientY - rect.top;

    let best = null;
    let bestDist = Infinity;
    for (const point of hit) {
      const dist = Math.hypot(point.px - mx, point.py - my);
      if (dist < bestDist) {
        bestDist = dist;
        best = point;
      }
    }

    if (best && bestDist < 24) {
      const b = best.bucket;
      panel.tip.textContent =
        `Rating ${b.low}\u2013${b.high}: avg ${b.avg.toFixed(2)} score (${b.count} users)`;
      const scale = rect.width / panel._cssW;
      panel.tip.style.left = `${rect.left + best.px * scale}px`;
      panel.tip.style.top = `${rect.top + best.py * scale}px`;
      panel.tip.style.opacity = '1';
    } else {
      panel.tip.style.opacity = '0';
    }
  }

  CF.drawChart = drawChart;
  CF.handleChartMove = handleChartMove;
})(window.CFContour = window.CFContour || {});