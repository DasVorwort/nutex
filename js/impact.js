/* ============================================================================
   NuTex Inc. — Business impact since AI go-live
   Level 1 (tile): average KPI improvement since each go-live + mini lines
   Level 2 (pop-up): KPI list (before → now, change, confidence, driver) and a
     deep-dive chart for the selected KPI with go-live marker, before/after
     averages, control group (no AI) and target.
   ============================================================================ */

window.NUTEX_IMPACT = (() => {
  const D = window.NUTEX_DATA;
  const S = window.NUTEX_STATE;
  const I = () => D.IMPACT;
  const OFFSET = 3; // series start 3 months before Jan 2026 (Oct–Dec 2025 = pre-AI baseline period)
  const LINE_COLORS = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6'];

  const avg = (a) => a.reduce((s, v) => s + v, 0) / Math.max(1, a.length);
  const fmt = (v, k) => (k.unit === '%' ? `${v.toFixed(1)}%` : k.unit === 'h' ? `${Math.round(v)} h` : k.unit === 'd' ? `${v.toFixed(1)} d` : v.toFixed(1));

  function nowIndex() {
    const i = D.TREND_2026.keys.indexOf(S.state.filters.timeframe);
    return OFFSET + (i < 0 ? D.TREND_2026.keys.length - 1 : i);
  }

  // KPIs in scope (department filter) — falls back to company-wide when a department has none
  function scope() {
    const sel = S.state.filters.dept;
    const all = I().kpis;
    if (sel === 'all') return { kpis: all, companyWide: true, fallback: false };
    const own = all.filter(k => k.depts.includes(sel));
    return own.length ? { kpis: own, companyWide: false, fallback: false } : { kpis: all, companyWide: true, fallback: true };
  }

  function stats(k, ni = nowIndex()) {
    const g = k.goLive;
    const live = ni >= g;
    const before = avg(k.series.slice(Math.max(0, g - 3), g));
    const now = k.series[ni];
    const rel = ((now - before) / before) * 100;
    const better = k.lowerIsBetter ? -rel : rel;            // + = improvement
    const ctrl = k.control ? ((k.control[ni] - avg(k.control.slice(Math.max(0, g - 3), g))) / avg(k.control.slice(Math.max(0, g - 3), g))) * 100 : null;
    const ctrlBetter = ctrl === null ? null : (k.lowerIsBetter ? -ctrl : ctrl);
    const net = ctrlBetter === null ? better : better - ctrlBetter;  // improvement beyond control group
    const delta = k.unit === '%' && !k.lowerIsBetter ? `${now - before >= 0 ? '+' : ''}${(now - before).toFixed(1)} pp`
      : `${rel >= 0 ? '+' : '−'}${Math.abs(rel).toFixed(0)}%`;
    return { live, before, now, rel, better, ctrlBetter, net, delta };
  }

  function summary() {
    const sc = scope();
    const ni = nowIndex();
    const live = sc.kpis.map(k => ({ k, s: stats(k, ni) })).filter(x => x.s.live);
    const improved = live.filter(x => x.s.better > 2).length;
    const avgBetter = live.length ? avg(live.map(x => x.s.better)) : 0;
    const best = live.slice().sort((a, b) => b.s.better - a.s.better)[0] || null;
    const euro = live.reduce((s, x) => s + (x.k.euroYear || 0), 0);
    return { ...sc, live, improved, avgBetter, best, euro, total: sc.kpis.length };
  }

  // ---------- Level 1: improvement since go-live, one line per KPI (up = better) ----------
  function mini() {
    const sm = summary();
    const ni = nowIndex();
    const w = 300;
    const h = 60;
    const start = OFFSET; // Jan 2026
    const span = Math.max(1, ni - start);
    const x = (i) => 4 + ((i - start) / span) * (w - 8);
    const lines = sm.live.map(({ k }) => {
      const g = k.goLive;
      const base = avg(k.series.slice(Math.max(0, g - 3), g));
      const pts = [];
      for (let i = Math.max(start, g - 1); i <= ni; i++) {
        const rel = ((k.series[i] - base) / base) * 100;
        pts.push([x(i), k.lowerIsBetter ? -rel : rel]);
      }
      return { k, pts };
    });
    const hi = Math.max(10, ...lines.flatMap(l => l.pts.map(p => p[1])));
    const lo = Math.min(-5, ...lines.flatMap(l => l.pts.map(p => p[1])));
    const y = (v) => h - 3 - ((v - lo) / (hi - lo)) * (h - 6);
    return `
      <svg class="ip-mini" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">
        <line x1="0" x2="${w}" y1="${y(0)}" y2="${y(0)}" stroke="var(--text-3)" stroke-dasharray="3 3" stroke-width="1" opacity="0.6" vector-effect="non-scaling-stroke"/>
        ${lines.map((l, i) => `<polyline points="${l.pts.map(p => `${p[0].toFixed(1)},${y(p[1]).toFixed(1)}`).join(' ')}" fill="none" stroke="${LINE_COLORS[I().kpis.indexOf(l.k) % LINE_COLORS.length]}" stroke-width="1.8" stroke-linejoin="round" vector-effect="non-scaling-stroke" opacity="0.9"/>`).join('')}
      </svg>
    `;
  }

  // ---------- Level 2 ----------
  function bigChart(k, ni) {
    const W = 760;
    const H = 250;
    const L = 46;
    const R = 744;
    const T = 26;
    const B = 214;
    const labels = I().labels;
    const n = ni + 1;
    const vals = k.series.slice(0, n).concat(k.control ? k.control.slice(0, n) : [], k.target !== undefined ? [k.target] : []);
    const pad = (Math.max(...vals) - Math.min(...vals)) * 0.18 || 1;
    const lo = Math.min(...vals) - pad;
    const hi = Math.max(...vals) + pad;
    const x = (i) => L + (i / (labels.length - 1)) * (R - L);
    const y = (v) => B - ((v - lo) / (hi - lo)) * (B - T);
    const st = stats(k, ni);
    const g = k.goLive;
    const line = (arr, color, wdt, dash) => `<polyline points="${arr.slice(0, n).map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')}" fill="none" stroke="${color}" stroke-width="${wdt}" ${dash ? `stroke-dasharray="${dash}"` : ''} stroke-linejoin="round" stroke-linecap="round"/>`;
    const grid = [0, 0.5, 1].map(f => {
      const v = lo + (hi - lo) * f;
      return `<line x1="${L}" x2="${R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--grid)"/><text x="${L - 8}" y="${y(v)}" text-anchor="end" dominant-baseline="central" font-size="10.5" fill="var(--text-3)">${fmt(v, k)}</text>`;
    }).join('');
    return `
      <svg class="ip-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${k.name} over time">
        ${grid}
        <rect x="${x(g)}" y="${T - 6}" width="${R - x(g)}" height="${B - T + 6}" fill="rgba(37,99,235,0.05)"/>
        <line x1="${x(g)}" x2="${x(g)}" y1="${T - 14}" y2="${B}" stroke="#2563EB" stroke-width="1.6"/>
        <rect x="${x(g) - 40}" y="${T - 24}" width="80" height="18" rx="9" fill="#2563EB"/>
        <text x="${x(g)}" y="${T - 15}" text-anchor="middle" dominant-baseline="central" font-size="10" font-weight="800" fill="#fff">AI go-live · ${labels[g]}</text>
        <line x1="${x(Math.max(0, g - 3))}" x2="${x(g)}" y1="${y(st.before)}" y2="${y(st.before)}" stroke="var(--text-2)" stroke-width="2" stroke-dasharray="5 3"/>
        <text x="${x(Math.max(0, g - 3))}" y="${y(st.before) - 6}" font-size="10" font-weight="700" fill="var(--text-2)">before ${fmt(st.before, k)}</text>
        ${k.target !== undefined ? `<line x1="${L}" x2="${R}" y1="${y(k.target)}" y2="${y(k.target)}" stroke="#10B981" stroke-dasharray="6 4" stroke-width="1.3"/><text x="${L + 6}" y="${y(k.target) + (k.lowerIsBetter ? 14 : -6)}" text-anchor="start" font-size="10" font-weight="700" fill="var(--green-txt)">target ${fmt(k.target, k)}</text>` : ''}
        ${k.control ? line(k.control, '#94A3B8', 2, '4 3') : ''}
        ${line(k.series, '#0F172A', 2.6)}
        <circle cx="${x(ni)}" cy="${y(st.now)}" r="5" fill="#0F172A"/>
        <text x="${x(ni) - 8}" y="${y(st.now) - 10}" text-anchor="end" font-size="11.5" font-weight="800" fill="var(--text)">${fmt(st.now, k)}</text>
        ${labels.map((l, i) => `<text x="${x(i)}" y="${H - 14}" text-anchor="middle" font-size="10" fill="${i <= ni ? 'var(--text-3)' : 'var(--border-hover)'}">${l}</text>`).join('')}
      </svg>
    `;
  }

  const CONF = {
    high:   { label: 'High',   cls: 'green',  text: 'Control group without AI stayed flat — the change can be attributed to AI.' },
    medium: { label: 'Medium', cls: 'yellow', text: 'Before/after only — other changes in the same period may contribute.' },
    low:    { label: 'Low',    cls: 'red',    text: 'Indirect effect — AI is one of several drivers.' }
  };

  function render() {
    const sm = summary();
    const ni = nowIndex();
    const sel = sm.kpis.find(k => k.id === S.state.impactKpi) || (sm.best ? sm.best.k : sm.kpis[0]);
    const st = stats(sel, ni);
    const conf = CONF[sel.confidence];
    const deptNames = (ids) => ids.map(id => (D.DEPARTMENTS.find(d => d.id === id) || {}).name || id).join(', ');
    const eur = (n) => '€' + Math.round(n / 1000) + 'k';

    return `
      <div class="ip">
        <div class="ip-head">
          <span class="b2-q">What has AI changed for our customers and operations?${sm.fallback ? ' <span class="ov-scope-pill">Company-wide — no KPI tracked for this department</span>' : ''}</span>
          <span class="ip-sum"><strong>${sm.improved}</strong> of ${sm.live.length} live KPIs better · avg <strong class="text-green">+${sm.avgBetter.toFixed(0)}%</strong> · ≈ <strong>${eur(sm.euro)}</strong>/yr</span>
        </div>
        <div class="ip-grid">
          <div class="ip-list">
            ${sm.kpis.map((k, i) => {
              const s = stats(k, ni);
              const c = CONF[k.confidence];
              const good = s.better > 2;
              return `
                <button type="button" class="ip-row ${k.id === sel.id ? 'is-sel' : ''} ${s.live ? '' : 'is-off'}" data-action="impact-kpi" data-kpi="${k.id}">
                  <i style="background:${LINE_COLORS[i % LINE_COLORS.length]}"></i>
                  <span class="ip-row-main">
                    <strong>${k.name}</strong>
                    <small>${s.live ? `${fmt(s.before, k)} → ${fmt(s.now, k)}` : `go-live ${I().labels[k.goLive]}`} · ${k.driver}</small>
                  </span>
                  <span class="ip-row-right">
                    ${s.live ? `<b class="${good ? 'text-green' : 'text-red'}">${s.delta}</b>` : '<b class="text-3">—</b>'}
                    <em class="ip-conf ip-conf-${c.cls}">${c.label}</em>
                  </span>
                </button>
              `;
            }).join('')}
          </div>
          <div class="ip-detail">
            <div class="ip-detail-head">
              <div>
                <h4>${sel.name}</h4>
                <span>${sel.unitLabel} · ${sel.lowerIsBetter ? 'lower is better' : 'higher is better'} · ${deptNames(sel.depts)}</span>
              </div>
              <div class="ip-kpis">
                <div><span>Before AI</span><strong>${fmt(st.before, sel)}</strong></div>
                <div><span>Now</span><strong>${st.live ? fmt(st.now, sel) : '—'}</strong></div>
                <div><span>Change</span><strong class="${st.better > 2 ? 'text-green' : 'text-red'}">${st.live ? st.delta : '—'}</strong></div>
                ${st.ctrlBetter !== null ? `<div><span>Beyond control</span><strong class="text-green">${st.net >= 0 ? '+' : ''}${st.net.toFixed(0)}%</strong></div>` : ''}
              </div>
            </div>
            ${bigChart(sel, ni)}
            <div class="ip-legend">
              <span><i class="ip-l-main"></i>${sel.name}</span>
              ${sel.control ? `<span><i class="ip-l-ctrl"></i>${sel.controlLabel}</span>` : ''}
              <span><i class="ip-l-before"></i>avg. 3 months before go-live</span>
            </div>
            <div class="ip-facts">
              <div class="ip-conf-box ip-conf-${conf.cls}"><strong>Attribution: ${conf.label}</strong> ${conf.text}</div>
              <div><span>Driven by</span><strong>${sel.driver}</strong><small>${sel.owner}</small></div>
              <div><span>€ impact</span><strong>${sel.euroYear ? `≈ ${eur(sel.euroYear)}/yr` : 'indirect'}</strong><small>${sel.euroNote}</small></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  return { summary, mini, render, stats };
})();
