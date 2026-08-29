/* charts.js — plain canvas drawing. No chart library, so it works offline.
   These are deliberately simple bar and line graphs, because children in
   Classes 3-5 are learning to READ exactly these graphs in Maths. */

const Charts = (() => {

  function prep(canvas) {
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width || canvas.clientWidth || 320;
    const h = Number(canvas.dataset.height || 200);
    canvas.width = w * ratio;
    canvas.height = h * ratio;
    canvas.style.height = h + 'px';
    const ctx = canvas.getContext('2d');
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, w, h);
    return { ctx, w, h };
  }

  function css(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  // Canvas cannot read CSS custom properties, so resolve them here.
  function color(value, fallback) {
    if (!value) return css(fallback);
    const m = /^var\(\s*(--[\w-]+)\s*\)$/.exec(value.trim());
    return m ? css(m[1]) : value;
  }

  // Whole-number axis steps, because these graphs are read in Maths class.
  function niceStep(max, target) {
    const raw = max / target;
    return [1, 2, 5, 10, 15, 20, 25, 50, 100].find(s => s >= raw) || Math.ceil(raw);
  }

  function roundRect(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    ctx.fill();
  }

  /* bars: [{label, value, color}] */
  function bars(canvas, data, opts = {}) {
    const { ctx, w, h } = prep(canvas);
    const pad = { t: 14, r: 8, b: 30, l: 26 };
    const plotW = w - pad.l - pad.r;
    const plotH = h - pad.t - pad.b;
    let max = Math.max(opts.min || 1, ...data.map(d => d.value));
    const step0 = niceStep(max, 5);
    max = Math.ceil(max / step0) * step0;
    const step = plotW / data.length;
    const bw = Math.min(38, step * 0.6);
    const ink = css('--ink');

    ctx.font = '11px system-ui, sans-serif';
    ctx.strokeStyle = css('--rule');
    ctx.fillStyle = ink;
    ctx.lineWidth = 1;

    // gridlines with whole-number labels — the axis a Class 4 child can read
    for (let v = 0; v <= max; v += step0) {
      const y = pad.t + plotH - (v / max) * plotH;
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.moveTo(pad.l, y + 0.5);
      ctx.lineTo(w - pad.r, y + 0.5);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.textAlign = 'right';
      ctx.fillText(v, pad.l - 6, y + 4);
    }

    data.forEach((d, i) => {
      const x = pad.l + step * i + (step - bw) / 2;
      const bh = (d.value / max) * plotH;
      ctx.fillStyle = color(d.color, '--veg');
      roundRect(ctx, x, pad.t + plotH - bh, bw, Math.max(bh, d.value ? 3 : 0), 6);
      ctx.fillStyle = ink;
      ctx.textAlign = 'center';
      ctx.font = '11px system-ui, sans-serif';
      ctx.fillText(d.label, x + bw / 2, h - 12);
      if (d.value) {
        ctx.font = '600 11px system-ui, sans-serif';
        ctx.fillText(d.value, x + bw / 2, pad.t + plotH - bh - 5);
      }
    });
  }

  /* points: [{label, value}] line chart, used for height over months */
  function line(canvas, points) {
    const { ctx, w, h } = prep(canvas);
    const pad = { t: 18, r: 14, b: 28, l: 38 };
    const plotW = w - pad.l - pad.r;
    const plotH = h - pad.t - pad.b;
    const values = points.map(p => p.value);
    const lo = Math.floor(Math.min(...values) - 2);
    const hi = Math.ceil(Math.max(...values) + 2);
    const span = Math.max(1, hi - lo);
    const stepX = points.length > 1 ? plotW / (points.length - 1) : 0;
    const accent = css('--dairy');

    ctx.font = '11px system-ui, sans-serif';
    ctx.strokeStyle = css('--rule');
    for (let i = 0; i <= 4; i++) {
      const v = lo + (span / 4) * i;
      const y = pad.t + plotH - ((v - lo) / span) * plotH;
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.moveTo(pad.l, y + 0.5);
      ctx.lineTo(w - pad.r, y + 0.5);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.fillStyle = css('--ink');
      ctx.textAlign = 'right';
      ctx.fillText(Math.round(v), pad.l - 6, y + 4);
    }

    ctx.strokeStyle = accent;
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    points.forEach((p, i) => {
      const x = pad.l + stepX * i;
      const y = pad.t + plotH - ((p.value - lo) / span) * plotH;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    points.forEach((p, i) => {
      const x = pad.l + stepX * i;
      const y = pad.t + plotH - ((p.value - lo) / span) * plotH;
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = css('--ink');
      ctx.textAlign = 'center';
      ctx.font = '11px system-ui, sans-serif';
      ctx.fillText(p.label, x, h - 10);
    });
  }

  return { bars, line };
})();
