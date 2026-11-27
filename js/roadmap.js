/* ============================================================================
   NuTex Inc. — AI Roadmap (Data · Technology · Skills · Rules)
   Date-based SVG timeline Jan 2026 – Dec 2027, hover/focus cards,
   critical-path highlighting and a summary used by the Overview
   (traffic light per lane + schedule score).
   ============================================================================ */

window.NUTEX_ROADMAP = (() => {
  const TODAY = '2026-11-21';

  // Phase plan: Pilot (H1 2026) → Scale (H2 2026 – H1 2027) → Embed (H2 2027)
  const PHASES = [
    { id: 'pilot', label: 'Pilot', from: '2026-01-01', to: '2026-06-30' },
    { id: 'scale', label: 'Scale', from: '2026-07-01', to: '2027-06-30' },
    { id: 'embed', label: 'Embed', from: '2027-07-01', to: '2027-12-31' }
  ];

  const P3 = '3 Production pilots, €120k a year';

  const LANES = [
    {
      id: 'data', label: 'Data',
      items: [
        { id: 'd1', short: 'Sources named',   title: 'Priority data sources identified (9)',               status: 'done',     date: '2026-03-31', owner: 'Head of IT' },
        { id: 'd2', short: 'Owners named',    title: 'A data owner named for each source',                status: 'done',     date: '2026-06-15', owner: 'VPs' },
        { id: 'd3', short: 'CRM data clean',  title: 'Sales CRM data cleaned & deduplicated',              status: 'done',     date: '2026-09-30', owner: 'Sales Ops' },
        { id: 'd4', short: 'Quality check',   title: 'Production data quality check (Plant A & B)',        status: 'open',     date: '2026-11-10', owner: null,            unlocks: P3, onPath: true },
        { id: 'd5', short: '7 of 9 sources',  title: '7 of 9 sources accessible — today 4 of 9',           status: 'open',     date: '2026-12-15', owner: 'VP Production', unlocks: P3, onPath: true },
        { id: 'd6', short: 'Plant B export',  title: 'Plant B loom machine data export',                   status: 'open',     date: '2027-03-31', owner: 'Maintenance lead', unlocks: 'Predictive Loom Maintenance pilot' },
        { id: 'd7', short: 'All 9 sources',   title: 'All 9 priority data sources connected',              status: 'proposed', date: '2027-09-30', owner: null }
      ]
    },
    {
      id: 'tech', label: 'Technology',
      items: [
        { id: 't1', short: 'Platform live',   title: 'Azure OpenAI EU gateway live',                      status: 'done',     date: '2026-04-15', owner: 'Head of IT' },
        { id: 't2', short: 'SSO & roles',     title: 'Secure SSO & role-based access',                    status: 'done',     date: '2026-07-31', owner: 'IT security' },
        { id: 't3', short: 'Spec library',    title: 'Textile spec library searchable (18,400 specs)',    status: 'done',     date: '2026-09-15', owner: 'R&D' },
        { id: 't4', short: 'ERP link',        title: 'SAP ERP link for production data',                  status: 'open',     date: '2026-10-31', owner: 'IT lead',       unlocks: P3, onPath: true },
        { id: 't5', short: 'Cost control',    title: 'Token & license cost control',                      status: 'done',     date: '2026-11-12', owner: 'Finance' },
        { id: 't6', short: 'Data platform',   title: 'Central data platform go-live',                     status: 'open',     date: '2027-01-29', owner: 'Head of IT',    unlocks: P3, onPath: true },
        { id: 't7', short: 'Core processes',  title: 'AI embedded in core processes',                     status: 'proposed', date: '2027-11-30', owner: null }
      ]
    },
    {
      id: 'skills', label: 'Skills',
      items: [
        { id: 's1', short: 'AI basics',       title: 'AI basics e-learning for all staff',                status: 'done',     date: '2026-03-15', owner: 'HR / L&D' },
        { id: 's2', short: 'Champions',       title: 'AI champion named in every team',                   status: 'done',     date: '2026-08-31', owner: 'VPs' },
        { id: 's3', short: 'Wave 2',          title: 'Training wave 2 — shopfloor & warehouse',           status: 'open',     date: '2026-12-05', owner: 'HR / L&D',      unlocks: 'Production & Logistics to 80% trained' },
        { id: 's4', short: 'AI literacy',     title: 'AI literacy records for all staff (EU AI Act Art. 4)', status: 'open',  date: '2027-03-31', owner: 'HR / Legal' },
        { id: 's5', short: 'Expert tracks',   title: 'Role-based expert tracks',                          status: 'proposed', date: '2027-09-30', owner: null }
      ]
    },
    {
      id: 'rules', label: 'Rules',
      items: [
        { id: 'r1', short: 'AI policy',       title: 'AI usage policy published',                         status: 'done',     date: '2026-02-27', owner: 'Legal' },
        { id: 'r2', short: 'Works council',   title: 'Works council agreement on AI use',                 status: 'open',     date: '2026-11-15', owner: 'Legal / HR',    unlocks: 'Shopfloor camera & usage analytics' },
        { id: 'r3', short: 'Risk register',   title: 'AI Act risk register for all use cases',            status: 'open',     date: '2026-12-18', owner: 'Compliance' },
        { id: 'r4', short: 'DPIA camera',     title: 'Data protection impact assessment — defect camera', status: 'open',     date: '2027-02-12', owner: 'Data protection officer' },
        { id: 'r5', short: 'Audit',           title: 'External AI governance audit',                      status: 'proposed', date: '2027-10-15', owner: null }
      ]
    }
  ];

  // ---------- Geometry ----------
  const W = 1160;
  const X0 = 150;
  const X1 = 1140;
  const TOP = 40;
  const LANE_GAP = 54;
  const H = TOP + LANES.length * LANE_GAP + 28;

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const ms = (iso) => { const [y, m, d] = iso.split('-').map(Number); return Date.UTC(y, m - 1, d); };
  const T0 = ms('2026-01-01');
  const T1 = ms('2027-12-31');
  const xOf = (iso) => X0 + ((ms(iso) - T0) / (T1 - T0)) * (X1 - X0);
  const fmt = (iso) => { const [y, m, d] = iso.split('-').map(Number); return `${d} ${MONTHS[m - 1]} ${y}`; };
  const daysLate = (iso) => Math.max(0, Math.round((ms(TODAY) - ms(iso)) / 86400000));

  function visualState(m) {
    if (m.status === 'done') return 'done';
    if (m.status === 'proposed') return 'proposed';
    return m.date < TODAY ? 'overdue' : 'open';
  }

  function statusMeta(m) {
    const vs = visualState(m);
    if (vs === 'done') return { text: `Done · ${fmt(m.date)}`, tone: 'done' };
    if (vs === 'overdue') return { text: `${daysLate(m.date)} days late (due ${fmt(m.date)})`, tone: 'overdue' };
    if (vs === 'proposed') return { text: `Later phase · ${fmt(m.date)}`, tone: 'proposed' };
    return { text: `Due ${fmt(m.date)}`, tone: 'open' };
  }

  const ITEM_INDEX = {};
  const LAYOUT = LANES.map((lane, li) => {
    const y = TOP + li * LANE_GAP + 22;
    let labelIdx = 0;
    const placed = lane.items.map(m => {
      const vs = visualState(m);
      const labeled = vs === 'open' || vs === 'overdue';
      const p = {
        ...m, onPath: !!m.onPath, unlocks: m.unlocks || null,
        x: xOf(m.date), y, visualState: vs, statusMeta: statusMeta(m),
        labeled, labelPos: labeled ? (labelIdx++ % 2 === 0 ? 'above' : 'below') : null,
        lane: lane.label
      };
      ITEM_INDEX[p.id] = p;
      return p;
    });
    return { ...lane, y, placed };
  });

  // ---------- Summary for Overview (traffic light + score) ----------
  function summary() {
    const all = Object.values(ITEM_INDEX);
    const planned = all.filter(m => m.status !== 'proposed');
    const done = all.filter(m => m.status === 'done').length;
    const overdue = all.filter(m => m.visualState === 'overdue');
    const dueByToday = done + overdue.length;
    const score = Math.round((done / Math.max(1, dueByToday)) * 100);

    const lanes = LAYOUT.map(l => {
      const od = l.placed.filter(m => m.visualState === 'overdue');
      const soon = l.placed.filter(m => m.visualState === 'open' && !m.owner);
      const level = od.some(m => m.onPath) ? 'red' : (od.length || soon.length) ? 'yellow' : 'green';
      const active = l.placed.filter(m => m.status !== 'proposed');
      return {
        id: l.id, label: l.label, level,
        done: active.filter(m => m.status === 'done').length,
        total: active.length,
        overdue: od
      };
    });
    const level = lanes.some(l => l.level === 'red') ? 'red' : lanes.some(l => l.level === 'yellow') ? 'yellow' : 'green';
    const openSorted = all
      .filter(m => m.visualState === 'overdue' || m.visualState === 'open')
      .sort((a, b) => (b.visualState === 'overdue') - (a.visualState === 'overdue') || (b.onPath - a.onPath) || a.date.localeCompare(b.date));
    const phase = PHASES.find(p => TODAY >= p.from && TODAY <= p.to) || PHASES[1];

    return {
      total: all.length, planned: planned.length, done, overdue, dueByToday, score,
      lanes, level, openSorted, phase: phase.label,
      fmt, daysLate
    };
  }

  // ---------- Render ----------
  function nodeMark(m) {
    const r = 7.5;
    const cx = m.x.toFixed(1);
    const cy = m.y;
    const parts = [];
    if (m.onPath && m.status !== 'done') {
      parts.push(`<circle class="rm-onpath-ring" cx="${cx}" cy="${cy}" r="${r + 4.5}" fill="none" stroke="#D9622B" stroke-width="1.8"/>`);
    }
    if (m.visualState === 'done') {
      parts.push(`<circle class="rm-dot" cx="${cx}" cy="${cy}" r="${r}" fill="#22A06B"/>`);
    } else if (m.visualState === 'overdue') {
      parts.push(`<circle class="rm-dot" cx="${cx}" cy="${cy}" r="${r}" fill="var(--surface)" stroke="#E5484D" stroke-width="2.6"/>`);
    } else if (m.visualState === 'proposed') {
      parts.push(`<circle class="rm-dot" cx="${cx}" cy="${cy}" r="${r}" fill="var(--surface)" stroke="#94A3B8" stroke-width="1.8" stroke-dasharray="2.6 2.2"/>`);
    } else {
      parts.push(`<circle class="rm-dot" cx="${cx}" cy="${cy}" r="${r}" fill="var(--surface)" stroke="#2563EB" stroke-width="2.6"/>`);
    }
    parts.push(`<circle cx="${cx}" cy="${cy}" r="15" fill="transparent"/>`);
    if (m.labeled) {
      const ly = m.labelPos === 'above' ? cy - 15 : cy + 22;
      const col = m.visualState === 'overdue' ? 'var(--red-txt)' : 'var(--text-2)';
      parts.push(`<text class="rm-label" x="${cx}" y="${ly}" text-anchor="middle" font-size="10.5" font-weight="600" fill="${col}">${m.short}</text>`);
    }
    const aria = `${m.title} — ${m.statusMeta.text}`.replace(/"/g, '&quot;');
    return `<g class="rm-node" tabindex="0" role="button" aria-label="${aria}" data-rm-id="${m.id}" data-on-path="${m.onPath ? 'true' : 'false'}">${parts.join('')}</g>`;
  }

  function renderSvg() {
    const tx = xOf(TODAY);
    const phases = PHASES.map(p => {
      const x1 = xOf(p.from);
      const x2 = xOf(p.to);
      const here = TODAY >= p.from && TODAY <= p.to;
      return `
        ${here ? `<rect class="rm-phase-scale" x="${x1}" y="4" width="${x2 - x1}" height="20" rx="6"/>` : ''}
        <text x="${(x1 + x2) / 2}" y="18" text-anchor="middle" font-size="11" font-weight="${here ? 700 : 600}" fill="${here ? '#2563EB' : 'var(--text-3)'}">${p.label}${here ? ' · we are here' : ''}</text>
        ${p.id !== 'pilot' ? `<line x1="${x1}" y1="4" x2="${x1}" y2="${H - 20}" stroke="var(--border)" stroke-width="1"/>` : ''}
      `;
    }).join('');

    const quarters = [];
    for (let y = 2026; y <= 2027; y++) {
      for (let q = 0; q < 4; q++) {
        const iso = `${y}-${String(q * 3 + 1).padStart(2, '0')}-01`;
        const x = xOf(iso);
        const x2 = xOf(q === 3 ? `${y}-12-31` : `${y}-${String(q * 3 + 4).padStart(2, '0')}-01`);
        quarters.push(`<text x="${(x + x2) / 2}" y="${H - 6}" text-anchor="middle" font-size="10" fill="var(--text-3)">Q${q + 1} ${String(y).slice(2)}</text>`);
      }
    }

    const lanes = LAYOUT.map(l => {
      const active = l.placed.filter(m => m.status !== 'proposed');
      const doneN = active.filter(m => m.status === 'done').length;
      return `
        <g class="rm-lane">
          <text x="2" y="${l.y}" dominant-baseline="central" font-size="12.5">
            <tspan font-weight="700" fill="var(--text)">${l.label}</tspan>
            <tspan dx="6" font-size="11" font-weight="500" fill="var(--text-3)">${doneN} of ${active.length}</tspan>
          </text>
          <line x1="${X0 - 6}" y1="${l.y}" x2="${X1}" y2="${l.y}" stroke="var(--border-hover)" stroke-width="1.6" stroke-linecap="round"/>
          ${l.placed.map(nodeMark).join('')}
        </g>
      `;
    }).join('');

    return `
      <svg class="roadmap-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="AI roadmap across Data, Technology, Skills and Rules">
        ${phases}
        <g class="rm-today">
          <line x1="${tx}" y1="28" x2="${tx}" y2="${H - 20}" stroke="var(--text-3)" stroke-width="1.3" stroke-dasharray="4 4" opacity="0.7"/>
        </g>
        ${lanes}
        ${quarters.join('')}
      </svg>
    `;
  }

  function legend() {
    return `
      <div class="rm-legend">
        <span class="rm-leg-item"><span class="rm-leg-dot rm-leg-done"></span>done</span>
        <span class="rm-leg-item"><span class="rm-leg-dot rm-leg-open"></span>planned, on track</span>
        <span class="rm-leg-item"><span class="rm-leg-dot rm-leg-overdue"></span>overdue</span>
        <span class="rm-leg-item"><span class="rm-leg-dot rm-leg-proposed"></span>later phase</span>
        <span class="rm-leg-item"><span class="rm-leg-dot rm-leg-path"></span>critical path</span>
        <span class="rm-leg-item"><span class="rm-leg-today"></span>today</span>
      </div>
    `;
  }

  function render({ compact = false } = {}) {
    return `
      <section class="card card-lg roadmap-section ${compact ? 'roadmap-compact' : ''}" aria-label="AI roadmap">
        <div class="panel-head roadmap-head">
          <h3><span class="ov-tag ov-tag-fix">FIX</span> Roadmap: are the foundations in place?</h3>
          <span class="muted-sm">Hover a milestone for owner & impact</span>
        </div>
        <div class="roadmap-stage" data-roadmap-stage>
          ${renderSvg()}
          <div class="rm-tooltip" data-rm-tooltip role="tooltip" aria-hidden="true"></div>
        </div>
        ${legend()}
      </section>
    `;
  }

  function buildCardHtml(m) {
    return `
      <div class="rm-card-title">${m.title}</div>
      <div class="rm-card-status rm-status-${m.statusMeta.tone}">${m.statusMeta.text}</div>
      <div class="rm-card-meta"><span>${m.lane} · Owner</span><strong>${m.owner || 'Unassigned'}</strong></div>
      ${m.unlocks ? `<div class="rm-card-unlocks"><span>Unlocks</span><strong>${m.unlocks}</strong></div>` : ''}
    `;
  }

  function showCard(stage, nodeEl) {
    const m = ITEM_INDEX[nodeEl.getAttribute('data-rm-id')];
    const tip = stage.querySelector('[data-rm-tooltip]');
    if (!m || !tip) return;
    tip.innerHTML = buildCardHtml(m);
    tip.classList.add('open');
    tip.setAttribute('aria-hidden', 'false');
    stage.classList.toggle('rm-path-active', !!m.onPath);

    const sr = stage.getBoundingClientRect();
    const nr = nodeEl.getBoundingClientRect();
    const tw = tip.offsetWidth || 260;
    const th = tip.offsetHeight || 110;
    let left = (nr.left - sr.left) + nr.width / 2 - tw / 2;
    left = Math.max(8, Math.min(sr.width - tw - 8, left));
    let top = (nr.top - sr.top) - th - 10;
    if (top < 4) top = (nr.bottom - sr.top) + 10;
    tip.style.left = `${Math.round(left)}px`;
    tip.style.top = `${Math.round(top)}px`;
  }

  function hideCard(stage) {
    if (!stage) return;
    const tip = stage.querySelector('[data-rm-tooltip]');
    if (tip) { tip.classList.remove('open'); tip.setAttribute('aria-hidden', 'true'); }
    stage.classList.remove('rm-path-active');
  }

  function bind(rootEl) {
    if (!rootEl || rootEl._roadmapBound) return;
    rootEl._roadmapBound = true;
    const stageOf = (e) => { const n = e.target.closest('.rm-node'); return n ? [n, n.closest('[data-roadmap-stage]')] : [null, null]; };
    rootEl.addEventListener('mouseover', e => { const [n, s] = stageOf(e); if (n && s) showCard(s, n); });
    rootEl.addEventListener('mouseout', e => {
      const [n, s] = stageOf(e);
      if (!n || (e.relatedTarget && n.contains(e.relatedTarget))) return;
      hideCard(s);
    });
    rootEl.addEventListener('focusin', e => { const [n, s] = stageOf(e); if (n && s) showCard(s, n); });
    rootEl.addEventListener('focusout', e => { const [n, s] = stageOf(e); if (n) hideCard(s); });
    rootEl.addEventListener('keydown', e => {
      if (e.key === 'Escape') hideCard(rootEl.querySelector('[data-roadmap-stage]'));
    });
  }

  return { TODAY, LANES, ITEM_INDEX, summary, render, bind };
})();
