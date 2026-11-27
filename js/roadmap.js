/* ============================================================================
   NuTex Inc. — Technical Roadmap Component (Data & Technology Lanes)
   Minimal, calm, single-glance SVG timeline. Local constant data, zero deps.
   Supports hover + keyboard focus cards and critical-path (onPath) highlighting.
   ============================================================================ */

window.NUTEX_ROADMAP = (() => {
  const TODAY = '2026-11-21';

  const PHASES = [
    { id: 'pilot', label: 'Pilot', x1: 152, x2: 340, here: false },
    { id: 'scale', label: 'Scale', x1: 340, x2: 980, here: true },
    { id: 'embed', label: 'Embed', x1: 980, x2: 1152, here: false }
  ];

  // Subtle vertical dashed "Today" line inside Scale between done/past and future milestones
  const TODAY_X = 680;

  const LANES = [
    {
      id: 'data',
      label: 'Data',
      y: 66,
      labelSide: 'above',
      items: [
        {
          id: 'data-sources-named',
          short: 'Sources named',
          title: 'Priority data sources identified',
          status: 'done',
          date: '2026-06-30',
          phase: 'pilot',
          segment: 'pilot',
          owner: null,
          unlocks: null,
          onPath: false
        },
        {
          id: 'data-owners-named',
          short: 'Owners named',
          title: 'A data owner named for each source',
          status: 'done',
          date: '2026-09-15',
          phase: 'pilot',
          segment: 'pilot',
          owner: null,
          unlocks: null,
          onPath: false
        },
        {
          id: 'data-7-of-9',
          short: '7 of 9 sources',
          title: '7 of 9 sources — Today 4 of 9 accessible',
          status: 'open',
          date: '2026-12-15',
          phase: 'scale',
          segment: 'scale-future',
          owner: 'VP Production',
          unlocks: '3 Production pilots, €120k a year',
          onPath: true
        },
        {
          id: 'data-quality-check',
          short: 'Quality check',
          title: 'Data quality check',
          status: 'open',
          date: null,
          phase: 'scale',
          segment: 'scale-future',
          owner: null,
          unlocks: '3 Production pilots, €120k a year',
          onPath: true
        },
        {
          id: 'data-policy',
          short: 'Data policy',
          title: 'Enterprise AI data policy',
          status: 'open',
          date: '2027-01-31',
          phase: 'scale',
          segment: 'scale-future',
          owner: 'Data protection officer',
          unlocks: null,
          onPath: false
        },
        {
          id: 'data-all-9',
          short: 'All 9 sources',
          title: 'All 9 priority data sources connected',
          status: 'proposed',
          date: '2027-09-30',
          phase: 'embed',
          segment: 'embed',
          owner: null,
          unlocks: null,
          onPath: false
        }
      ]
    },
    {
      id: 'technology',
      label: 'Technology',
      y: 114,
      labelSide: 'below',
      items: [
        {
          id: 'tech-platform-live',
          short: 'Platform live',
          title: 'Core AI platform live',
          status: 'done',
          date: '2026-06-15',
          phase: 'pilot',
          segment: 'pilot',
          owner: null,
          unlocks: null,
          onPath: false
        },
        {
          id: 'tech-secure-access',
          short: 'Secure access',
          title: 'Secure SSO & role-based access',
          status: 'done',
          date: '2026-10-10',
          phase: 'scale',
          segment: 'scale-past',
          owner: null,
          unlocks: null,
          onPath: false
        },
        {
          id: 'tech-fast-access',
          short: 'Fast access',
          title: 'Low-latency AI gateway & model access',
          status: 'done',
          date: '2026-10-28',
          phase: 'scale',
          segment: 'scale-past',
          owner: null,
          unlocks: null,
          onPath: false
        },
        {
          id: 'tech-erp-link',
          short: 'ERP link',
          title: 'ERP system link',
          status: 'open',
          date: '2026-10-31',
          phase: 'scale',
          segment: 'scale-past',
          owner: 'IT lead',
          unlocks: '3 Production pilots, €120k a year',
          onPath: true
        },
        {
          id: 'tech-cost-control',
          short: 'Cost control',
          title: 'Token & license cost control',
          status: 'done',
          date: '2026-11-12',
          phase: 'scale',
          segment: 'scale-past',
          owner: null,
          unlocks: null,
          onPath: false
        },
        {
          id: 'tech-core-processes',
          short: 'Core processes',
          title: 'AI embedded in core processes',
          status: 'proposed',
          date: '2027-12-15',
          phase: 'embed',
          segment: 'embed',
          owner: null,
          unlocks: null,
          onPath: false
        }
      ]
    }
  ];

  // Generous horizontal spacing per segment so single-baseline labels never collide
  const SEGMENTS = {
    'pilot':        { start: 162, end: 332 },
    'scale-past':   { start: 350, end: 672 },
    'scale-future': { start: 690, end: 970 },
    'embed':        { start: 992, end: 1138 }
  };

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function parseIso(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    return Date.UTC(y, m - 1, d);
  }

  function formatDate(iso) {
    if (!iso) return '';
    const [y, m, d] = iso.split('-').map(Number);
    return `${d} ${MONTHS[m - 1]} ${y}`;
  }

  function daysLate(iso) {
    if (!iso) return 0;
    const diff = Math.round((parseIso(TODAY) - parseIso(iso)) / 86400000);
    return diff > 0 ? diff : 0;
  }

  function getVisualState(m) {
    if (m.status === 'done') return 'done';
    if (m.status === 'proposed') return 'proposed';
    if (m.status === 'open' && m.date && m.date < TODAY) return 'overdue';
    return 'open';
  }

  function getStatusMeta(m) {
    const vs = getVisualState(m);
    if (vs === 'done') return { text: `Done on ${formatDate(m.date)}`, tone: 'done' };
    if (vs === 'overdue') return { text: `${daysLate(m.date)} days late (due ${formatDate(m.date)})`, tone: 'overdue' };
    if (vs === 'proposed') return { text: m.date ? `Proposed · Due ${formatDate(m.date)}` : 'Proposed · No date', tone: 'proposed' };
    if (!m.date) return { text: 'No date', tone: 'open' };
    return { text: `Due ${formatDate(m.date)}`, tone: 'open' };
  }

  function layoutLaneItems(items, labelSide) {
    const grouped = {};
    items.forEach(m => {
      if (!grouped[m.segment]) grouped[m.segment] = [];
      grouped[m.segment].push(m);
    });

    const posMap = {};
    Object.entries(grouped).forEach(([segKey, list]) => {
      const seg = SEGMENTS[segKey];
      const n = list.length;
      const step = (seg.end - seg.start) / n;
      list.forEach((m, i) => {
        posMap[m.id] = seg.start + step * (i + 0.5);
      });
    });

    return items.map(m => ({
      ...m,
      x: posMap[m.id],
      labelPos: labelSide,
      visualState: getVisualState(m),
      statusMeta: getStatusMeta(m)
    }));
  }

  const ITEM_INDEX = {};
  const LAYOUT_LANES = LANES.map(lane => {
    const placed = layoutLaneItems(lane.items, lane.labelSide);
    placed.forEach(p => { ITEM_INDEX[p.id] = { ...p, laneLabel: lane.label, laneY: lane.y }; });
    const doneCount = lane.items.filter(m => m.status === 'done').length;
    const activeTotal = lane.items.filter(m => m.status !== 'proposed').length;
    return { ...lane, placed, doneCount, activeTotal };
  });

  function renderNodeMark(m, y) {
    const r = 8;
    const cx = m.x.toFixed(1);
    const cy = y;
    const parts = [];

    if (m.onPath) {
      parts.push(`<circle class="rm-onpath-ring" cx="${cx}" cy="${cy}" r="${r + 4}" fill="none" stroke="#D9622B" stroke-width="2"/>`);
    }

    if (m.visualState === 'done') {
      parts.push(`<circle class="rm-dot" cx="${cx}" cy="${cy}" r="${r}" fill="#0F6E6E" stroke="#0F6E6E" stroke-width="1.5"/>`);
      parts.push(`<path d="M ${(m.x - 3.3).toFixed(1)} ${cy + 0.2} L ${(m.x - 0.9).toFixed(1)} ${cy + 2.7} L ${(m.x + 3.6).toFixed(1)} ${cy - 2.6}" fill="none" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`);
    } else if (m.visualState === 'overdue') {
      parts.push(`<circle class="rm-dot" cx="${cx}" cy="${cy}" r="${r}" fill="#FFFFFF" stroke="#EF4444" stroke-width="2.4"/>`);
    } else if (m.visualState === 'proposed') {
      parts.push(`<circle class="rm-dot" cx="${cx}" cy="${cy}" r="${r}" fill="var(--surface)" stroke="#94A3B8" stroke-width="1.8" stroke-dasharray="2.6 2.2"/>`);
    } else {
      parts.push(`<circle class="rm-dot" cx="${cx}" cy="${cy}" r="${r}" fill="#FFFFFF" stroke="#1E293B" stroke-width="2"/>`);
    }

    parts.push(`<circle cx="${cx}" cy="${cy}" r="16" fill="transparent"/>`);

    const labelY = m.labelPos === 'above' ? cy - 19 : cy + 23;
    parts.push(`<text class="rm-label" x="${cx}" y="${labelY}" text-anchor="middle" font-size="11" font-weight="500" fill="var(--text-2)">${m.short}</text>`);

    const aria = `${m.title} — ${m.statusMeta.text}`;
    return `
      <g class="rm-node" tabindex="0" role="button" aria-label="${aria.replace(/"/g, '&quot;')}" data-rm-id="${m.id}" data-on-path="${m.onPath ? 'true' : 'false'}">
        ${parts.join('')}
      </g>
    `;
  }

  function render() {
    const w = 1160;
    const h = 156;
    const isDe = window.NUTEX_STATE && window.NUTEX_STATE.state.lang === 'de';

    const phaseCols = PHASES.map(p => {
      const pw = p.x2 - p.x1;
      const midX = p.x1 + pw / 2;
      return `
        <g>
          ${p.here ? `<rect class="rm-phase-scale" x="${p.x1}" y="2" width="${pw}" height="142" rx="10"/>` : ''}
          ${p.here ? `
            <text x="${midX}" y="19" text-anchor="middle" font-size="11.5">
              <tspan font-weight="700" fill="var(--text)">${p.label}</tspan>
              <tspan dx="6" font-size="10.5" font-weight="600" fill="#0F6E6E" class="rm-here-text">· we are here</tspan>
            </text>
          ` : `
            <text x="${midX}" y="19" text-anchor="middle" font-size="11.5" font-weight="600" fill="var(--text-3)">${p.label}</text>
          `}
        </g>
      `;
    }).join('');

    const phaseDividers = PHASES.slice(1).map(p =>
      `<line x1="${p.x1}" y1="8" x2="${p.x1}" y2="140" stroke="var(--border)" stroke-width="1" opacity="0.65"/>`
    ).join('');

    const laneMarkup = LAYOUT_LANES.map(lane => {
      const nodes = lane.placed.map(m => renderNodeMark(m, lane.y)).join('');
      return `
        <g class="rm-lane">
          <text x="2" y="${lane.y}" dominant-baseline="central" font-size="12.5">
            <tspan font-weight="700" fill="var(--text)">${lane.label}</tspan>
            <tspan dx="6" font-size="11.5" font-weight="500" fill="var(--text-3)">${lane.doneCount} of ${lane.activeTotal}</tspan>
          </text>
          <line x1="156" y1="${lane.y}" x2="1148" y2="${lane.y}" stroke="var(--border-hover)" stroke-width="1.8" stroke-linecap="round"/>
          ${nodes}
        </g>
      `;
    }).join('');

    const todayLine = `
      <g class="rm-today">
        <line x1="${TODAY_X}" y1="30" x2="${TODAY_X}" y2="138" stroke="var(--text-3)" stroke-width="1.3" stroke-dasharray="4 4" opacity="0.55"/>
        <text x="${TODAY_X}" y="151" text-anchor="middle" font-size="10" font-weight="600" fill="var(--text-3)">Today</text>
      </g>
    `;

    return `
      <section class="card card-lg roadmap-section" aria-label="Technical roadmap">
        <div class="panel-head roadmap-head">
          <h3>Technical roadmap</h3>
          <span class="muted-sm">${isDe ? 'Details per Hover' : 'Hover for details'}</span>
        </div>

        <div class="roadmap-stage" data-roadmap-stage>
          <svg class="roadmap-svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="Technical roadmap across Data and Technology lanes">
            ${phaseCols}
            ${phaseDividers}
            ${todayLine}
            ${laneMarkup}
          </svg>
          <div class="rm-tooltip" data-rm-tooltip role="tooltip" aria-hidden="true"></div>
        </div>
      </section>
    `;
  }

  function buildCardHtml(m) {
    const ownerText = m.owner ? m.owner : 'Unassigned';
    return `
      <div class="rm-card-title">${m.title}</div>
      <div class="rm-card-status rm-status-${m.statusMeta.tone}">${m.statusMeta.text}</div>
      <div class="rm-card-meta"><span>Owner</span><strong>${ownerText}</strong></div>
      ${m.unlocks ? `
        <div class="rm-card-unlocks">
          <span>Unlocks</span>
          <strong>${m.unlocks}</strong>
        </div>
      ` : ''}
    `;
  }

  function showCard(stage, nodeEl) {
    const id = nodeEl.getAttribute('data-rm-id');
    const m = ITEM_INDEX[id];
    const tip = stage.querySelector('[data-rm-tooltip]');
    if (!m || !tip) return;

    tip.innerHTML = buildCardHtml(m);
    tip.classList.add('open');
    tip.setAttribute('aria-hidden', 'false');

    stage.classList.toggle('rm-path-active', !!m.onPath);

    const stageRect = stage.getBoundingClientRect();
    const nodeRect = nodeEl.getBoundingClientRect();
    const tipW = tip.offsetWidth || 260;
    const tipH = tip.offsetHeight || 110;

    let left = (nodeRect.left - stageRect.left) + (nodeRect.width / 2) - (tipW / 2);
    left = Math.max(8, Math.min(stageRect.width - tipW - 8, left));

    let top = (nodeRect.top - stageRect.top) - tipH - 12;
    if (top < 6) {
      top = (nodeRect.bottom - stageRect.top) + 12;
    }

    tip.style.left = `${Math.round(left)}px`;
    tip.style.top = `${Math.round(top)}px`;
  }

  function hideCard(stage) {
    if (!stage) return;
    const tip = stage.querySelector('[data-rm-tooltip]');
    if (tip) {
      tip.classList.remove('open');
      tip.setAttribute('aria-hidden', 'true');
    }
    stage.classList.remove('rm-path-active');
  }

  function bind(rootEl) {
    if (!rootEl || rootEl._roadmapBound) return;
    rootEl._roadmapBound = true;

    rootEl.addEventListener('mouseover', e => {
      const node = e.target.closest('.rm-node');
      if (!node) return;
      const stage = node.closest('[data-roadmap-stage]');
      if (stage) showCard(stage, node);
    });

    rootEl.addEventListener('mouseout', e => {
      const node = e.target.closest('.rm-node');
      if (!node) return;
      if (e.relatedTarget && node.contains(e.relatedTarget)) return;
      const stage = node.closest('[data-roadmap-stage]');
      if (stage) hideCard(stage);
    });

    rootEl.addEventListener('focusin', e => {
      const node = e.target.closest('.rm-node');
      if (!node) return;
      const stage = node.closest('[data-roadmap-stage]');
      if (stage) showCard(stage, node);
    });

    rootEl.addEventListener('focusout', e => {
      const node = e.target.closest('.rm-node');
      if (!node) return;
      const stage = node.closest('[data-roadmap-stage]');
      if (stage) hideCard(stage);
    });

    rootEl.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        const stage = rootEl.querySelector('[data-roadmap-stage]');
        if (stage) hideCard(stage);
      }
    });
  }

  return { TODAY, LANES, ITEM_INDEX, render, bind };
})();
