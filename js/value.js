/* ============================================================================
   NuTex Inc. — Level 2: "Which pilots should we implement?"
   Opened from the "Value per € spent" tile. Left: company value per € and
   trend. Right: bubble chart of pilots (x = value per €, y = employees
   affected, size = monthly cost) with four decision zones and hover cards.
   ============================================================================ */

window.NUTEX_VALUE = (() => {
  const D = window.NUTEX_DATA;

  const X_MAX = 4;          // value per €
  const Y_MAX = 140;        // employees affected
  const Y_SPLIT = 40;       // "broad impact" threshold
  const ZONES = {
    implement: { label: 'Implement',  color: '#10B981', bg: 'rgba(16,185,129,0.09)', txt: 'var(--green-txt)', hint: 'pays off for many people' },
    niche:     { label: 'Niche win',  color: '#3B82F6', bg: 'rgba(59,130,246,0.07)', txt: 'var(--blue)',      hint: 'pays off, few people' },
    improve:   { label: 'Improve',    color: '#F59E0B', bg: 'rgba(245,158,11,0.09)', txt: 'var(--yellow-txt)', hint: 'many people, not paying off yet' },
    stop:      { label: 'Stop',       color: '#EF4444', bg: 'rgba(239,68,68,0.08)',  txt: 'var(--red-txt)',   hint: 'costs more than it returns' }
  };

  const eur = (n) => '€' + Math.round(n).toLocaleString('en-US');
  const eurK = (n) => n >= 10000 ? `€${(n / 1000).toFixed(1).replace(/\.0$/, '')}k` : eur(n);
  const deptName = (id) => (D.DEPARTMENTS.find(d => d.id === id) || {}).name || id;

  function zoneOf(p) {
    const v = p.valueMo / p.costMo;
    if (v >= 1) return p.employees >= Y_SPLIT ? 'implement' : 'niche';
    return p.employees >= Y_SPLIT ? 'improve' : 'stop';
  }

  const pilots = () => D.PILOTS.map(p => ({ ...p, vpe: p.valueMo / p.costMo, zone: zoneOf(p) }));

  function spark(values, { w = 260, h = 70, ref = 1, color = '#10B981' } = {}) {
    const all = values.concat([ref]);
    const lo = Math.min(...all);
    const hi = Math.max(...all);
    const pad = (hi - lo) * 0.15 || 0.2;
    const y = (v) => h - 4 - ((v - (lo - pad)) / ((hi + pad) - (lo - pad))) * (h - 8);
    const x = (i) => 4 + (i / Math.max(1, values.length - 1)) * (w - 10);
    const pts = values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
    const last = values.length - 1;
    return `
      <svg class="vl-spark" viewBox="0 0 ${w} ${h + 16}" aria-hidden="true">
        <line x1="0" x2="${w}" y1="${y(ref)}" y2="${y(ref)}" stroke="#EF4444" stroke-dasharray="4 3" stroke-width="1" opacity="0.7"/>
        <text x="${w - 2}" y="${y(ref) + 13}" text-anchor="end" font-size="10" font-weight="600" fill="var(--red-txt)">break-even 1.0</text>
        <polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>
        <circle cx="${x(last)}" cy="${y(values[last])}" r="4" fill="${color}"/>
      </svg>
    `;
  }

  function miniTrend(values, color) {
    const w = 120;
    const h = 28;
    const lo = Math.min(...values, 0.4);
    const hi = Math.max(...values, 1.2);
    const y = (v) => h - 3 - ((v - lo) / (hi - lo || 1)) * (h - 6);
    const x = (i) => 2 + (i / (values.length - 1)) * (w - 4);
    return `
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true">
        <line x1="0" x2="${w}" y1="${y(1)}" y2="${y(1)}" stroke="var(--text-3)" stroke-dasharray="2 2" stroke-width="1" opacity="0.6"/>
        <polyline points="${values.map((v, i) => `${x(i)},${y(v)}`).join(' ')}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round"/>
      </svg>
    `;
  }

  function chart(list) {
    const W = 820;
    const H = 330;
    const L = 54;
    const R = 806;
    const T = 10;
    const B = 292;
    const px = (v) => L + (Math.min(v, X_MAX) / X_MAX) * (R - L);
    const py = (e) => B - (Math.min(e, Y_MAX) / Y_MAX) * (B - T);
    const x1 = px(1);
    const ys = py(Y_SPLIT);
    const zone = (k, x, y, w, h, ax, ay, anchor) => `
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${ZONES[k].bg}"/>
      <text x="${ax}" y="${ay}" text-anchor="${anchor}" font-size="11.5" font-weight="700" fill="${ZONES[k].txt}">${ZONES[k].label}</text>
    `;
    const rOf = (c) => 6 + Math.sqrt(c) * 0.34;

    const ticksX = [0, 1, 2, 3, 4].map(v => `
      <text x="${px(v)}" y="${B + 16}" text-anchor="middle" font-size="10.5" fill="var(--text-3)">${v === 1 ? '1.0 break-even' : `€${v}`}</text>
    `).join('');
    const ticksY = [0, 40, 70, 140].map(e => `
      <text x="${L - 8}" y="${py(e)}" text-anchor="end" dominant-baseline="central" font-size="10.5" fill="var(--text-3)">${e}</text>
    `).join('');

    const bubbles = list.slice().sort((a, b) => b.costMo - a.costMo).map(p => {
      const cx = px(p.vpe);
      const cy = py(p.employees);
      const r = rOf(p.costMo);
      const z = ZONES[p.zone];
      const live = p.status === 'Live';
      return `
        <g class="vl-bubble" data-q="${p.zone}" data-pilot="${p.id}" tabindex="0" role="button" aria-label="${p.name}: €${p.vpe.toFixed(2)} per €, ${p.employees} employees">
          <circle cx="${cx}" cy="${cy}" r="${r}" fill="${z.color}" fill-opacity="${live ? 0.95 : 0.8}" stroke="${live ? 'var(--text)' : 'var(--surface)'}" stroke-width="${live ? 2 : 1.5}"/>
          <text x="${cx}" y="${p.employees < 20 ? cy - r - 6 : cy + r + 13}" text-anchor="middle" font-size="11.5" font-weight="600" fill="var(--text-2)">${p.name}</text>
        </g>
      `;
    }).join('');

    return `
      <svg class="vl-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Pilots by value per euro and employees affected">
        ${zone('improve', L, T, x1 - L - 3, ys - T - 3, L + 10, T + 18, 'start')}
        ${zone('implement', x1 + 3, T, R - x1 - 3, ys - T - 3, R - 10, T + 18, 'end')}
        ${zone('stop', L, ys + 3, x1 - L - 3, B - ys - 3, L + 10, B - 10, 'start')}
        ${zone('niche', x1 + 3, ys + 3, R - x1 - 3, B - ys - 3, R - 10, B - 10, 'end')}
        <line x1="${x1}" x2="${x1}" y1="${T}" y2="${B}" stroke="var(--text-3)" stroke-dasharray="4 4" stroke-width="1.2"/>
        <line x1="${L}" x2="${R}" y1="${B}" y2="${B}" stroke="var(--border-hover)"/>
        ${ticksX}${ticksY}
        <text x="${R}" y="${H - 4}" text-anchor="end" font-size="11" font-weight="700" fill="var(--text-2)">value per € →</text>
        <text transform="translate(12 ${(T + B) / 2}) rotate(-90)" text-anchor="middle" font-size="11" font-weight="700" fill="var(--text-2)">employees affected</text>
        ${bubbles}
      </svg>
    `;
  }

  // Opened from the overview; company KPI comes from the overview metrics
  function render({ ratio, valueMo, costMo, series, labels }) {
    const list = pilots();
    const prev = series.length > 1 ? series[series.length - 2] : ratio;
    const diff = ratio - prev;
    const counts = Object.keys(ZONES).map(k => ({ k, n: list.filter(p => p.zone === k).length }));
    const pv = list.reduce((s, p) => s + p.valueMo, 0);
    const pc = list.reduce((s, p) => s + p.costMo, 0);

    return `
      <section class="card card-lg vl-card" aria-label="Which pilots should we implement?">
        <div class="panel-head">
          <h3>Which pilots should we implement?</h3>
        </div>
        <div class="vl-wrap" data-vl-stage>
          <div class="vl-left">
            <span class="vl-lbl">Value per € spent</span>
            <div class="vl-big">€${ratio.toFixed(2)}</div>
            <div class="vl-meta">target ≥ €1.00</div>
            <div class="vl-meta"><strong>${eurK(valueMo)} value</strong> vs <strong>${eurK(costMo)} cost</strong> per month</div>
            <div class="vl-meta ${diff >= 0 ? 'text-green' : 'text-red'}"><strong>${diff >= 0 ? '+' : ''}${diff.toFixed(2)}</strong> vs last month</div>
            ${spark(series, { color: ratio >= 1 ? '#10B981' : '#EF4444' })}
            <div class="vl-axis"><span>${labels[0]}</span><span>${labels[labels.length - 1]}</span></div>

            <span class="vl-lbl" style="margin-top:14px">${list.length} pilots · ${eurK(pv)} value vs ${eurK(pc)} cost</span>
            <div class="vl-chips">
              ${counts.map(c => `
                <span class="vl-chip" data-q="${c.k}" title="${ZONES[c.k].hint}">
                  <i style="background:${ZONES[c.k].color}"></i>${ZONES[c.k].label} <strong>${c.n}</strong>
                </span>
              `).join('')}
            </div>
          </div>
          <div class="vl-right">
            ${chart(list)}
            <div class="vl-foot">Bubble size = cost per month · dark outline = live · hover a pilot for details</div>
            <div class="vl-tooltip" data-vl-tooltip role="tooltip" aria-hidden="true"></div>
          </div>
        </div>
      </section>
    `;
  }

  function cardHtml(p) {
    const z = ZONES[p.zone];
    return `
      <div class="vl-tip-head">
        <strong>${p.name}</strong>
        <span class="vl-tip-zone" style="background:${z.bg};color:${z.txt}">${z.label}</span>
      </div>
      <div class="vl-tip-sub">${p.full} · ${deptName(p.deptId)} · ${p.owner}</div>
      <div class="vl-tip-grid">
        <span>Value per €</span><strong style="color:${z.txt}">€${p.vpe.toFixed(2)}</strong>
        <span>Value / month</span><strong>${eur(p.valueMo)}</strong>
        <span>Cost / month</span><strong>${eur(p.costMo)}</strong>
        <span>Employees</span><strong>${p.employees}</strong>
        <span>Status</span><strong>${p.status} since ${p.since}</strong>
      </div>
      <div class="vl-tip-trend">
        <span>Value per € · Jun → Nov</span>
        ${miniTrend(p.trend, z.color)}
      </div>
      <div class="vl-tip-result">${p.result}</div>
      <div class="vl-tip-next"><span>Next step</span>${p.next}</div>
    `;
  }

  function show(stage, node) {
    const p = pilots().find(x => x.id === node.getAttribute('data-pilot'));
    const tip = stage.querySelector('[data-vl-tooltip]');
    if (!p || !tip) return;
    tip.innerHTML = cardHtml(p);
    tip.classList.add('open');
    stage.classList.add('vl-focus');
    stage.querySelectorAll('.vl-bubble').forEach(b => b.classList.toggle('is-active', b === node));

    const host = tip.parentElement.getBoundingClientRect();
    const r = node.getBoundingClientRect();
    const tw = tip.offsetWidth || 280;
    const th = tip.offsetHeight || 220;
    let left = r.right - host.left + 12;
    if (left + tw > host.width) left = r.left - host.left - tw - 12;
    let top = r.top - host.top + r.height / 2 - th / 2;
    top = Math.max(0, Math.min(host.height - th, top));
    tip.style.left = `${Math.round(left)}px`;
    tip.style.top = `${Math.round(top)}px`;
  }

  function hide(stage) {
    if (!stage) return;
    const tip = stage.querySelector('[data-vl-tooltip]');
    if (tip) tip.classList.remove('open');
    stage.classList.remove('vl-focus');
    stage.querySelectorAll('.vl-bubble.is-active').forEach(b => b.classList.remove('is-active'));
  }

  function bind(root) {
    if (!root || root._valueBound) return;
    root._valueBound = true;
    const find = (e) => { const n = e.target.closest('.vl-bubble'); return n ? [n, n.closest('[data-vl-stage]')] : [null, null]; };
    root.addEventListener('mouseover', e => { const [n, s] = find(e); if (n && s) show(s, n); });
    root.addEventListener('mouseout', e => {
      const [n, s] = find(e);
      if (!n || (e.relatedTarget && n.contains(e.relatedTarget))) return;
      hide(s);
    });
    root.addEventListener('focusin', e => { const [n, s] = find(e); if (n && s) show(s, n); });
    root.addEventListener('focusout', e => { const [n, s] = find(e); if (n) hide(s); });
  }

  return { render, bind, pilots };
})();
