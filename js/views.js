/* ============================================================================
   NuTex Inc. — Ultra-Lean, Bilingual (EN/DE) & Dark-Mode-Ready Executive Views
   ============================================================================ */

window.NUTEX_VIEWS = (() => {
  const D = window.NUTEX_DATA;
  const S = window.NUTEX_STATE;
  const C = window.NUTEX_CHARTS;

  const t = (k, v) => S.t(k, v);
  const infoBtn = (key) => `<button type="button" class="info-btn" data-kpi-info="${key}" aria-label="Info">i</button>`;
  const dot = (level) => `<span class="dot dot-${level}"></span>`;
  const eur = (n) => '€' + Math.round(n).toLocaleString(S.state.lang === 'de' ? 'de-DE' : 'en-US');
  const deptLabel = (id) => D.DEPARTMENTS.find(d => d.id === id)?.name || id;

  function renderProgressLine({ pct, targetPct, level }) {
    return `
      <div class="hero-line-wrap">
        <div class="hero-line-track">
          <div class="hero-line-fill fill-${level}" style="width:${Math.max(2, Math.min(100, pct))}%"></div>
          <div class="hero-line-target" style="left:${Math.min(100, targetPct)}%" title="${t('target')}"></div>
        </div>
      </div>
    `;
  }

  function statusBadge(status) {
    const map = { Pending: 'badge-yellow', Approved: 'badge-green', Blocked: 'badge-red', Declined: 'badge-gray' };
    return `<span class="badge ${map[status] || 'badge-gray'}">${t(status)}</span>`;
  }

  // ==========================================================================
  // 1. OVERVIEW — 3 rows: AI Readiness (FIX) · AI Adoption (PUSH) · AI Projects (FUND)
  //    3 KPI cards per row (left 3/4) + a To-do block per row (right 1/4)
  // ==========================================================================
  const annualValue = (outcome) => {
    const m = String(outcome || '').match(/€\s?([\d.,]+)\s*(k)?/i);
    if (!m) return 0;
    const n = Number(m[1].replace(/[.,]/g, ''));
    return m[2] ? n * 1000 : n;
  };
  const eurK = (n) => Math.abs(n) >= 10000 ? `€${(n / 1000).toFixed(Math.abs(n) >= 100000 ? 0 : 1).replace(/\.0$/, '')}k` : eur(n);
  const LV = { green: 'var(--green)', yellow: 'var(--yellow)', red: 'var(--red)', blue: 'var(--blue)', gray: 'var(--border-hover)' };
  const STATUS_TXT = { green: 'On track', yellow: 'Watch', red: 'Action' };
  // target met = green · within 15 pp = yellow · more than 15 pp below = red
  const ppLevel = (v, target) => v >= target ? 'green' : v >= target - 15 ? 'yellow' : 'red';

  function sparkline(values, { color = 'var(--blue)', ref = null, w = 300, h = 56 } = {}) {
    if (!values || values.length < 2) return '';
    const all = ref !== null ? values.concat([ref]) : values;
    const lo = Math.min(...all);
    const hi = Math.max(...all);
    const pad = (hi - lo) * 0.12 || 1;
    const y = (v) => h - 4 - ((v - (lo - pad)) / ((hi + pad) - (lo - pad))) * (h - 8);
    const x = (i) => (i / (values.length - 1)) * (w - 8) + 4;
    const pts = values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
    const last = values.length - 1;
    return `
      <svg class="ov-spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">
        ${ref !== null ? `<line x1="0" x2="${w}" y1="${y(ref).toFixed(1)}" y2="${y(ref).toFixed(1)}" stroke="var(--text-3)" stroke-dasharray="3 4" stroke-width="1" opacity="0.5" vector-effect="non-scaling-stroke"/>` : ''}
        <polygon points="4,${h} ${pts} ${x(last).toFixed(1)},${h}" fill="${color}" opacity="0.10"/>
        <polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/>
      </svg>
    `;
  }

  function donut(pct, level, size = 40) {
    const r = size / 2 - 4;
    const c = 2 * Math.PI * r;
    const dash = (Math.max(0, Math.min(100, pct)) / 100) * c;
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true">
        <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--track)" stroke-width="5"/>
        <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${LV[level]}" stroke-width="5" stroke-linecap="round"
          stroke-dasharray="${dash.toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 ${size / 2} ${size / 2})"/>
        <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" font-size="10.5" font-weight="700" fill="var(--text)">${pct}</text>
      </svg>
    `;
  }

  function miniBars(items, { target = null } = {}) {
    return `
      <div class="ov-mini">
        ${items.map(it => `
          <div class="ov-mini-row">
            <span class="ov-mini-lbl">${it.label}</span>
            <div class="ov-mini-track">
              <div class="ov-mini-fill" style="width:${Math.max(2, Math.min(100, it.value))}%;background:${it.color || LV[it.level] || LV.blue};"></div>
              ${target !== null ? `<i class="ov-mini-target" style="left:${target}%"></i>` : ''}
            </div>
            <span class="ov-mini-val">${it.display ?? `${it.value}%`}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  function segments(parts) {
    const total = Math.max(1, parts.reduce((s, p) => s + p.n, 0));
    return `
      <div class="ov-seg">
        ${parts.filter(p => p.n > 0).map(p => `<div style="flex:${p.n};background:${p.color};" title="${p.label}: ${p.n}"></div>`).join('')}
      </div>
      <div class="ov-seg-legend">
        ${parts.filter(p => p.legend !== false).map(p => `<span><i style="background:${p.color}"></i>${p.label} <strong>${p.display ?? p.n}</strong></span>`).join('')}
      </div>
    `.replace('TOTAL', total);
  }

  function tile({ title, level, hero, unit, context, visual, foot, nav, action, extra = '', cls = '' }) {
    const attr = action ? `data-action="${action}"` : `data-nav-tab="${nav}"`;
    return `
      <div class="ov-tile ${cls}" ${attr} role="button" tabindex="0">
        <div class="ov-tile-head">
          <span class="ov-tile-title">${title}</span>
          <span class="ov-status ov-status-${level}">${STATUS_TXT[level]}</span>
        </div>
        <div class="ov-tile-hero">
          <span class="ov-num">${hero}${unit ? `<small>${unit}</small>` : ''}</span>
          <span class="ov-ctx">${context}</span>
          ${extra}
        </div>
        <div class="ov-tile-vis">${visual}</div>
        <div class="ov-tile-foot">${foot}</div>
      </div>
    `;
  }

  function todoItem({ title, sub, badge, level = 'yellow', nav, action }) {
    const a = action ? `data-action="${action}"` : `data-nav-tab="${nav}"`;
    return `
      <button type="button" class="ov-todo" ${a}>
        <span class="ov-todo-bar ov-todo-bar-${level}"></span>
        <span class="ov-todo-main">
          <strong>${title}</strong>
          <span>${sub}</span>
        </span>
        ${badge ? `<span class="ov-badge ov-badge-${level}">${badge}</span>` : ''}
      </button>
    `;
  }

  function overviewRow({ tag, title, question, tiles, todos, cols = 3 }) {
    return `
      <section class="ov-row">
        <div class="ov-row-main">
          <div class="ov-row-head">
            <span class="ov-tag ov-tag-${tag.toLowerCase()}">${tag}</span>
            <h2 class="ov-row-title">${title}</h2>
            <span class="ov-row-q">${question}</span>
          </div>
          <div class="ov-tile-grid ov-cols-${cols}">${tiles.join('')}</div>
        </div>
        <div class="ov-row-side">
          <div class="ov-todo-block">
            ${todos.length ? todos.slice(0, 3).join('') : `<div class="ov-todo-empty">✓ Nothing open</div>`}
          </div>
        </div>
      </section>
    `;
  }

  // Monthly series Jan → selected month (re-computes metrics per month)
  function monthSeries(fn) {
    const keys = D.TREND_2026.keys;
    const cur = S.state.filters.timeframe;
    const idx = Math.max(0, keys.indexOf(cur));
    const out = keys.slice(0, idx + 1).map(k => { S.state.filters.timeframe = k; return fn(S.computeMetrics()); });
    S.state.filters.timeframe = cur;
    return out;
  }

  function renderOverview(metrics) {
    const role = S.getRole();
    const isCEO = role.isCEO;
    const showFin = S.canViewFinancials();
    const R = window.NUTEX_ROADMAP;
    const rm = R.summary();
    const tfIdx = Math.max(0, D.TREND_2026.keys.indexOf(S.state.filters.timeframe));

    // ======================= FIX · AI READINESS =======================
    const critLate = rm.overdue.filter(m => m.onPath);
    const lamp = (l) => `<span class="ov-lamp ov-lamp-${l} ${rm.level === l ? 'on' : ''}"></span>`;
    const t1 = tile({
      title: 'Roadmap status', level: rm.level, action: 'open-roadmap',
      hero: rm.overdue.length, unit: ' late',
      context: `${critLate.length} on critical path`,
      extra: `<span class="ov-lights">${lamp('red')}${lamp('yellow')}${lamp('green')}</span>`,
      visual: `
        <div class="ov-lanes">
          ${rm.lanes.map(l => `
            <div class="ov-lane">
              <i style="background:${LV[l.level]}"></i>
              <span>${l.label}</span>
              <strong class="${l.overdue.length ? 'text-red' : ''}">${l.overdue.length ? `${l.overdue.length} late` : `${l.done}/${l.total}`}</strong>
            </div>
          `).join('')}
        </div>
      `,
      foot: `<span class="link-btn">Open roadmap →</span>`
    });

    const scoreLevel = rm.score >= 90 ? 'green' : rm.score >= 75 ? 'yellow' : 'red';
    const upcoming = rm.planned - rm.done - rm.overdue.length;
    const t2 = tile({
      title: 'Roadmap score', level: scoreLevel, action: 'open-roadmap',
      hero: rm.score, unit: '%',
      context: `${rm.done} of ${rm.dueByToday} due milestones done`,
      visual: segments([
        { label: 'Done', n: rm.done, color: 'var(--green)' },
        { label: 'Late', n: rm.overdue.length, color: 'var(--red)' },
        { label: 'Upcoming', n: upcoming, color: 'var(--border-hover)' }
      ]),
      foot: `Phase <strong>${rm.phase}</strong> · ${rm.planned} milestones planned`
    });

    const fixTodos = [];
    rm.openSorted.filter(m => m.visualState === 'overdue' || !m.owner).slice(0, 2).forEach(m => {
      const late = m.visualState === 'overdue';
      fixTodos.push(todoItem({
        title: !m.owner ? `Name owner: ${m.short.toLowerCase()}` : m.onPath ? `Escalate ${m.short}` : `Close ${m.short.toLowerCase()}`,
        sub: `${m.lane} · ${m.owner || 'no owner'}`,
        badge: late ? `${rm.daysLate(m.date)}d late` : 'no owner',
        level: late && m.onPath ? 'red' : 'yellow',
        action: 'open-roadmap'
      }));
    });
    const reallocN = Math.min(metrics.unusedLicenses, metrics.openRequests);
    if (reallocN > 0) {
      fixTodos.push(todoItem({
        title: `Reallocate ${reallocN} seats`,
        sub: `${metrics.openRequests} employees waiting for a license`,
        badge: showFin && metrics.unusedCostMo ? `${eur(Math.round(metrics.unusedCostMo * reallocN / Math.max(1, metrics.unusedLicenses)))}/mo` : null,
        nav: 'licenses'
      }));
    }

    // ======================= PUSH · AI ADOPTION =======================
    const diff = metrics.weeklyPct - metrics.weeklyPrevPct;
    const deptSorted = metrics.rows.slice().sort((a, b) => b.weeklyPct - a.weeklyPct);
    const lag = deptSorted[deptSorted.length - 1];
    const t4 = tile({
      title: 'Weekly use by department', level: ppLevel(metrics.weeklyPct, D.TARGETS.weeklyPct), nav: 'departments',
      hero: metrics.weeklyPct, unit: '%',
      context: `<span class="${diff >= 0 ? 'text-green' : 'text-red'}">${diff >= 0 ? '+' : ''}${diff} pp</span> vs. last month · target ${D.TARGETS.weeklyPct}%`,
      visual: `
        <div class="ov-donuts">
          ${deptSorted.map(r => `
            <div class="ov-donut ${!isCEO && role.ownDepts.includes(r.dept.id) ? 'is-own' : ''}" title="${r.dept.name}: ${r.weeklyPct}%">
              ${donut(r.weeklyPct, ppLevel(r.weeklyPct, D.TARGETS.weeklyPct))}
              <span>${r.dept.name === 'Purchasing' ? 'Purch.' : r.dept.name === 'Production' ? 'Prod.' : r.dept.name === 'Marketing' ? 'Mktg.' : r.dept.name === 'Logistics' ? 'Logist.' : r.dept.name}</span>
            </div>
          `).join('')}
        </div>
      `,
      foot: lag ? `Lowest: <strong>${lag.dept.name} ${lag.weeklyPct}%</strong>` : ''
    });

    const steps = [
      { label: 'All', n: metrics.totalEmp },
      { label: 'Target group', n: metrics.targetUsers },
      { label: 'Trained', n: metrics.trainedCount },
      { label: 'Weekly users', n: metrics.weeklyUsers }
    ];
    let gapIdx = 2;
    let gapN = 0;
    for (let i = 2; i < steps.length; i++) {
      const drop = steps[i - 1].n - steps[i].n;
      if (drop > gapN) { gapN = drop; gapIdx = i; }
    }
    const t5 = tile({
      title: 'Where do we lose employees?', level: ppLevel(metrics.trainedPct, D.TARGETS.trainingPct), nav: 'trainings',
      hero: gapN, unit: ' lost',
      context: `${steps[gapIdx - 1].label.toLowerCase()} → ${steps[gapIdx].label.toLowerCase()}`,
      visual: miniBars(steps.map((s, i) => ({
        label: s.label,
        value: Math.round((s.n / Math.max(1, metrics.totalEmp)) * 100),
        color: i === gapIdx ? 'var(--red)' : i === 3 ? 'var(--blue)' : '#93A9F0',
        display: `${s.n}`
      }))),
      foot: `${metrics.untrainedCount} employees not trained yet`
    });

    const culture = S.computeCulture();
    const pSeries = culture.trend.actual.slice(0, tfIdx + 1);
    const pPrev = pSeries.length > 1 ? pSeries[pSeries.length - 2] : culture.overallPct;
    const pDiff = culture.overallPct - pPrev;
    const pLevel = ppLevel(culture.overallPct, 75);
    const weakest = culture.questions.slice().sort((a, b) => a.pct - b.pct)[0];
    const t6 = tile({
      title: 'People score', level: pLevel, nav: 'culture',
      hero: culture.overallPct, unit: '%',
      context: `<span class="${pDiff >= 0 ? 'text-green' : 'text-red'}">${pDiff >= 0 ? '+' : ''}${pDiff} pp</span> · ${culture.responsePct}% responded`,
      visual: sparkline(pSeries, { color: LV[pLevel], ref: 75 }),
      foot: weakest ? `Weakest: <strong>${weakest.label}</strong> ${weakest.pct}%` : ''
    });

    const pushTodos = [];
    const pendT = metrics.pendingTrainings;
    if (pendT.length) {
      pushTodos.push(todoItem({
        title: isCEO ? `Approve ${pendT.length} trainings` : `${pendT.length} trainings awaiting CEO`,
        sub: `${pendT.reduce((s, x) => s + x.participants, 0)} employees · closes the training gap`,
        badge: showFin ? eur(pendT.reduce((s, x) => s + (x.budget || 0), 0)) : null,
        nav: 'trainings'
      }));
    }
    if (lag && lag.weeklyPct < D.TARGETS.weeklyPct) {
      pushTodos.push(todoItem({
        title: `Adoption plan for ${lag.dept.name}`,
        sub: `with ${lag.dept.vp}`,
        badge: `${lag.weeklyPct}%`, level: ppLevel(lag.weeklyPct, D.TARGETS.weeklyPct),
        nav: 'departments'
      }));
    }
    if (weakest && weakest.pct < 75) {
      pushTodos.push(todoItem({
        title: 'Close the tool gap',
        sub: `Top wish: ${culture.wishRanking[0]?.name || '—'}`,
        badge: `${weakest.pct}%`, level: ppLevel(weakest.pct, 75),
        nav: 'culture'
      }));
    }

    // ======================= FUND · AI PROJECTS =======================
    let t7;
    if (showFin) {
      const ratio = metrics.costSavedMo / Math.max(1, metrics.totalSpendMo);
      const rSeries = monthSeries(m => m.costSavedMo / Math.max(1, m.totalSpendMo));
      const rLevel = ratio >= 1.5 ? 'green' : ratio >= 1 ? 'yellow' : 'red';
      t7 = tile({
        title: 'Value per € spent', level: rLevel, nav: 'budget',
        hero: `€${ratio.toFixed(2)}`,
        context: `${eurK(metrics.costSavedMo)} value · ${eurK(metrics.totalSpendMo)} cost`,
        visual: sparkline(rSeries, { color: LV[rLevel], ref: 1 }),
        foot: `Dashed = break-even · <strong>${metrics.hoursSavedMo.toLocaleString('en-US')} h</strong> saved`
      });
    } else {
      const hSeries = monthSeries(m => m.hoursSavedMo);
      const hT = Math.round(D.TARGETS.hoursSavedMo * (metrics.totalEmp / 300));
      t7 = tile({
        title: 'Hours saved', level: ppLevel(Math.round((metrics.hoursSavedMo / Math.max(1, hT)) * 100), 100), nav: 'departments',
        hero: metrics.hoursSavedMo.toLocaleString('en-US'), unit: ' h',
        context: `per month · target ${hT.toLocaleString('en-US')} h`,
        visual: sparkline(hSeries, { color: LV.green }),
        foot: `Jan → ${metrics.tf.label}`
      });
    }

    let t8;
    if (showFin) {
      const bLevel = metrics.budgetUsedPct > 100 ? 'red' : metrics.budgetUsedPct > 85 ? 'yellow' : 'green';
      t8 = tile({
        title: 'Budget used', level: bLevel, nav: 'budget',
        hero: metrics.budgetUsedPct, unit: '%',
        context: `${eur(metrics.totalSpendMo)} of ${eur(metrics.budgetLimit)}`,
        visual: segments([
          { label: 'Licenses', n: metrics.licenseSpendMo, color: '#3B82F6', display: eurK(metrics.licenseSpendMo) },
          { label: 'Tokens', n: metrics.tokenSpendMo, color: '#8B5CF6', display: eurK(metrics.tokenSpendMo) },
          { label: 'Projects', n: metrics.projectSpendMo, color: '#10B981', display: eurK(metrics.projectSpendMo) },
          { label: 'Training', n: metrics.trainingSpendMo, color: '#F59E0B', display: eurK(metrics.trainingSpendMo) },
          { label: '', n: Math.max(0, metrics.budgetRemaining), color: 'transparent', legend: false }
        ]),
        foot: metrics.budgetRemaining >= 0
          ? `<strong>${eur(metrics.budgetRemaining)}</strong> left this month`
          : `<strong class="text-red">${eur(-metrics.budgetRemaining)}</strong> over budget`
      });
    } else {
      t8 = tile({
        title: 'Proposals in approval', level: metrics.pendingProjects.length ? 'yellow' : 'green', nav: 'projects',
        hero: metrics.pendingProjects.length, context: 'waiting for CEO decision',
        visual: '', foot: ''
      });
    }

    const liveN = metrics.approvedProjects.length;
    const pendN = metrics.pendingProjects.length;
    const blockN = metrics.blockedProjects.length;
    const liveValue = metrics.approvedProjects.reduce((s, p) => s + annualValue(p.outcome), 0);
    const nextP = metrics.pendingProjects.slice().sort((a, b) => annualValue(b.outcome) - annualValue(a.outcome))[0];
    const t9 = tile({
      title: 'Pilots', level: blockN ? 'yellow' : 'green', nav: 'projects',
      hero: liveN, unit: ' live',
      context: `${eurK(liveValue)} value per year`,
      visual: segments([
        { label: 'Live', n: liveN, color: 'var(--green)' },
        { label: 'In approval', n: pendN, color: 'var(--yellow)' },
        { label: 'Blocked', n: blockN, color: 'var(--red)' }
      ]),
      foot: nextP ? `Next: <strong>${nextP.name}</strong>` : 'No pilot waiting'
    });

    const fundTodos = [];
    if (pendN) {
      fundTodos.push(todoItem({
        title: isCEO ? `Approve ${pendN} AI projects` : `${pendN} projects awaiting CEO`,
        sub: `${eurK(metrics.pendingProjects.reduce((s, p) => s + annualValue(p.outcome), 0))}/yr potential`,
        badge: showFin ? eur(metrics.pendingProjects.reduce((s, p) => s + (p.budget || 0), 0)) : null,
        nav: 'projects'
      }));
    }
    metrics.blockedProjects.slice(0, 1).forEach(p => {
      fundTodos.push(todoItem({
        title: `Unblock ${p.name}`,
        sub: p.outcome.replace(/^Blocked:\s*/i, ''),
        badge: 'blocked', level: 'red',
        action: 'open-roadmap'
      }));
    });
    if (showFin && metrics.budgetUsedPct > 85) {
      fundTodos.push(todoItem({
        title: 'Review AI budget',
        sub: 'Approvals need more headroom',
        badge: `${metrics.budgetUsedPct}%`,
        nav: 'budget'
      }));
    }

    const openCount = fixTodos.length + pushTodos.length + fundTodos.length;

    return `
      <div class="overview-screen ov-screen">
        <div class="ov-head">
          <span class="ov-head-scope">${isCEO ? 'Company status' : `${role.title} · ${role.name}`} · ${metrics.tf.label}</span>
          <div class="ov-head-side">
            <span class="ov-head-scope">${isCEO ? 'Your to-dos' : 'To-dos'}</span>
            <span class="ov-badge ov-badge-red">${openCount} open</span>
          </div>
        </div>

        ${overviewRow({ tag: 'FIX', title: 'AI Readiness', question: 'Are the foundations in place?', tiles: [t2, t1], todos: fixTodos, cols: 2 })}
        ${overviewRow({ tag: 'PUSH', title: 'AI Adoption', question: 'Are our people using AI?', tiles: [t4, t5, t6], todos: pushTodos })}
        ${overviewRow({ tag: 'FUND', title: 'AI Projects', question: 'Does AI pay off?', tiles: [t7, t8, t9], todos: fundTodos })}
      </div>
      ${S.state.roadmapOpen ? `
        <div class="ov-modal-backdrop" data-action="close-roadmap">
          <div class="ov-modal" role="dialog" aria-label="AI roadmap">
            <button type="button" class="ov-modal-close" data-action="close-roadmap" aria-label="Close">✕</button>
            ${R.render()}
          </div>
        </div>
      ` : ''}
    `;
  }

  // ==========================================================================
  // 1b. READINESS — Drill-down: Roadmap + Data Sources + Systems
  // ==========================================================================
  function renderReadiness(metrics) {
    return `
      <div class="page-stack">
        ${window.NUTEX_ROADMAP ? window.NUTEX_ROADMAP.render() : ''}
        <div class="split-2">
          <div class="card card-lg">
            <div class="panel-head">
              <h3>Data sources ready ${infoBtn('dataReady')}</h3>
              <span class="muted-sm">${metrics.dataSourcesReady} / ${metrics.dataSourcesTotal} · target ${D.TARGETS.dataSourcesReady} / 9</span>
            </div>
            <table class="clean-table">
              <thead><tr><th>Department</th><th>Ready</th><th>Status</th></tr></thead>
              <tbody>
                ${metrics.rows.slice().sort((a, b) => (a.dataSourcesReady / a.dataSourcesTotal) - (b.dataSourcesReady / b.dataSourcesTotal)).map(r => {
                  const lvl = r.dataSourcesReady >= r.dataSourcesTotal ? 'green' : r.dataSourcesReady > 0 ? 'yellow' : 'red';
                  return `
                    <tr>
                      <td><strong>${r.dept.name}</strong></td>
                      <td>${r.dataSourcesReady} / ${r.dataSourcesTotal}</td>
                      <td><span class="pill pill-${lvl}">${dot(lvl)} ${lvl === 'green' ? 'Ready' : lvl === 'yellow' ? 'Partly' : 'Not ready'}</span></td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
          <div class="card card-lg">
            <div class="panel-head"><h3>Systems</h3></div>
            <table class="clean-table">
              <tbody>
                ${D.SYSTEMS.map(s => {
                  const lvl = s.status === 'Live' ? 'green' : s.status === 'Blocked' ? 'red' : 'yellow';
                  return `
                    <tr>
                      <td><strong>${s.name}</strong><br><span class="muted-sm">${s.detail}</span></td>
                      <td><span class="pill pill-${lvl}">${dot(lvl)} ${s.status}</span></td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // 2. PROJECTS
  // ==========================================================================
  function renderProjects(metrics) {
    const role = S.getRole();
    const showFin = S.canViewFinancials();
    const filter = S.state.projectFilter === 'Blocked' ? 'all' : S.state.projectFilter;
    const list = metrics.projects.filter(p => filter === 'all' || p.status === filter);

    return `
      <div class="page-stack">
        <div class="projects-toolbar">
          <div class="seg-group">
            ${['all', 'Pending', 'Approved', 'Declined'].map(st => `
              <button type="button" class="seg-btn ${filter === st ? 'active' : ''}" data-proj-filter="${st}">
                ${st === 'all' ? `${t('all')} (${metrics.projects.length})` : t(st)}
              </button>
            `).join('')}
          </div>
          <button type="button" class="btn-primary" data-action="open-project-modal">${t('new_project')}</button>
        </div>

        <div class="project-cards-grid">
          ${list.map(p => `
            <div class="card project-card">
              <div class="project-card-top">
                <div>
                  <h3 class="project-name">${p.name}</h3>
                  <span class="muted-sm">${deptLabel(p.deptId)} · ${p.owner}</span>
                </div>
                ${statusBadge(p.status)}
              </div>

              <div class="project-outcome-box">
                <span class="outcome-lbl">${t('outcome')}</span>
                <strong>${p.outcome}</strong>
              </div>

              <div class="project-card-foot">
                <div class="muted-sm">${showFin && p.budget ? `<strong>${eur(p.budget)}</strong> · ` : ''}${p.timeline}</div>
                ${role.isCEO ? `
                  <div class="approve-btns">
                    ${p.status === 'Pending' ? `
                      <button type="button" class="btn-approve" data-project-approve="${p.id}">${t('approve')}</button>
                      <button type="button" class="btn-decline" data-project-decline="${p.id}">${t('decline')}</button>
                    ` : (p.status === 'Approved' || p.status === 'Declined' ? `
                      <button type="button" class="btn-subtle-xs" data-project-reset="${p.id}">${t('undo')}</button>
                    ` : '')}
                  </div>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // 3. TRAININGS
  // ==========================================================================
  function renderTrainings(metrics) {
    const role = S.getRole();
    const showFin = S.canViewFinancials();
    const trnSt = S.getStatus(metrics.trainedPct, D.TARGETS.trainingPct);
    const filter = S.state.trainingFilter;
    const list = metrics.trainings.filter(tr => filter === 'all' || tr.status === filter);

    const deptBars = metrics.rows
      .slice()
      .sort((a, b) => a.trainedPct - b.trainedPct)
      .map(r => ({
        id: r.dept.id,
        label: r.dept.name,
        value: r.trainedPct,
        display: `${r.trainedPct}%`,
        level: S.getStatus(r.trainedPct, D.TARGETS.trainingPct).level,
        isOwn: !role.isCEO && role.ownDepts.includes(r.dept.id)
      }));

    return `
      <div class="page-stack">
        <div class="hero-row">
          <div class="card card-lg">
            <div class="card-top">
              <span class="card-title">${t('employees_trained')} ${infoBtn('training')}</span>
              <span class="pill pill-${trnSt.level}">${dot(trnSt.level)} ${trnSt.label}</span>
            </div>
            <div class="hero-main">
              <span class="big-num">${metrics.trainedPct}%</span>
              <span class="muted-lg">${metrics.untrainedCount} ${t('untrained_suffix')}</span>
            </div>
            ${renderProgressLine({
              pct: metrics.trainedPct,
              targetPct: D.TARGETS.trainingPct,
              level: trnSt.level
            })}
            <div class="hero-sub">
              <span>${t('target')} ${D.TARGETS.trainingPct}%</span>
              <strong class="text-${trnSt.level}">${metrics.trainedPct - D.TARGETS.trainingPct}%</strong>
            </div>
          </div>

          <div class="card card-lg">
            <div class="panel-head"><h3>${t('by_dept')}</h3></div>
            ${C.renderTargetBars({
              items: deptBars,
              max: 100,
              target: D.TARGETS.trainingPct,
              unit: '%',
              compact: true
            })}
          </div>
        </div>

        <div class="projects-toolbar">
          <div class="seg-group">
            ${['all', 'Pending', 'Approved', 'Declined'].map(st => `
              <button type="button" class="seg-btn ${filter === st ? 'active' : ''}" data-train-filter="${st}">
                ${st === 'all' ? `${t('all')} (${metrics.trainings.length})` : t(st)}
              </button>
            `).join('')}
          </div>
          <button type="button" class="btn-primary" data-action="open-training-modal">${t('request_training')}</button>
        </div>

        <div class="project-cards-grid">
          ${list.map(tr => `
            <div class="card project-card">
              <div class="project-card-top">
                <div>
                  <h3 class="project-name">${tr.name}</h3>
                  <span class="muted-sm">${deptLabel(tr.deptId)} · ${tr.participants} ${t('emp')}</span>
                </div>
                ${statusBadge(tr.status)}
              </div>

              <div class="project-outcome-box">
                <span class="outcome-lbl">${t('outcome')}</span>
                <strong>${tr.outcome}</strong>
              </div>

              <div class="project-card-foot">
                <div class="muted-sm">${showFin && tr.budget ? `<strong>${eur(tr.budget)}</strong> · ` : ''}${tr.timeline}</div>
                ${role.isCEO ? `
                  <div class="approve-btns">
                    ${tr.status === 'Pending' ? `
                      <button type="button" class="btn-approve" data-train-approve="${tr.id}">${t('approve')}</button>
                      <button type="button" class="btn-decline" data-train-decline="${tr.id}">${t('decline')}</button>
                    ` : `
                      <button type="button" class="btn-subtle-xs" data-train-reset="${tr.id}">${t('undo')}</button>
                    `}
                  </div>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // 4. LICENSES
  // ==========================================================================
  function renderLicenses(metrics) {
    const showFin = S.canViewFinancials();
    const utilSt = S.getStatus(metrics.licenseActivePct, D.TARGETS.licenseActivePct);
    const reallocNum = Math.min(metrics.unusedLicenses, metrics.openRequests);
    const cancelNum = Math.min(25, Math.max(0, metrics.unusedLicenses - reallocNum));
    const cancelSave = Math.round(cancelNum * 36);
    const hasActions = S.state.reallocatedSeats > 0 || S.state.cancelledSeats > 0;

    return `
      <div class="page-stack">
        <div class="hero-row">
          <div class="card card-lg">
            <div class="panel-head">
              <h3>${t('licenses')} ${infoBtn('licenses')}</h3>
              <span class="pill pill-${utilSt.level}">${dot(utilSt.level)} ${metrics.licenseActivePct}% ${t('active')}</span>
            </div>
            <div class="hero-main">
              <span class="big-num">${metrics.unusedLicenses}<small> ${t('unused')}</small></span>
              <span class="muted-lg">/ ${metrics.purchased} ${t('paid')}</span>
            </div>
            ${C.renderFunnel({ purchased: metrics.purchased, assigned: metrics.assigned, active: metrics.activeSeats })}
            <div class="footnote-split">
              <span><strong>${metrics.openRequests}</strong> ${t('open_requests')}</span>
              <span>${showFin ? `<strong>${eur(metrics.costPerActive)}</strong> ${t('per_active_user')}` : `${t('target')} ${D.TARGETS.licenseActivePct}%`}</span>
            </div>
          </div>

          <div class="card card-lg">
            <div class="panel-head">
              <h3>${t('actions')}</h3>
              ${hasActions ? `<button type="button" class="link-btn" data-action="reset-licenses">${t('reset')}</button>` : ''}
            </div>
            <div class="todo-list">
              <div class="todo-row ${reallocNum === 0 ? 'todo-done' : ''}">
                ${dot(reallocNum > 0 ? 'yellow' : 'green')}
                <div class="todo-txt">
                  <strong>${reallocNum > 0 ? t('reallocate_seats', { n: reallocNum }) : t('all_requests_filled')}</strong>
                  <span>${reallocNum > 0 ? t('unused_to_req') : t('zero_requests')}</span>
                </div>
                ${reallocNum > 0 ? `<button type="button" class="btn-primary-sm" data-lic-realloc="${reallocNum}">${t('reallocate_btn')}</button>` : `<span class="badge badge-green">${t('done')}</span>`}
              </div>

              <div class="todo-row ${cancelNum === 0 ? 'todo-done' : ''}">
                ${dot(cancelNum > 0 ? 'red' : 'green')}
                <div class="todo-txt">
                  <strong>${cancelNum > 0 ? t('cancel_n_seats', { n: cancelNum }) : t('no_excess_seats')}</strong>
                  <span>${cancelNum > 0 && showFin ? t('save_mo', { v: eur(cancelSave) }) : t('optimized')}</span>
                </div>
                ${cancelNum > 0 ? `<button type="button" class="btn-decline" data-lic-cancel="${cancelNum}">${t('cancel_seats_btn')}</button>` : `<span class="badge badge-green">${t('done')}</span>`}
              </div>
            </div>
          </div>
        </div>

        <div class="card card-lg">
          <div class="panel-head"><h3>${t('by_dept')}</h3></div>
          <table class="clean-table">
            <thead><tr><th>${t('dept_col')}</th><th>${t('paid_col')}</th><th>${t('active_col')}</th><th>${t('unused_col')}</th></tr></thead>
            <tbody>
              ${metrics.rows.slice().sort((a, b) => b.unusedLicenses - a.unusedLicenses).map(r => `
                <tr>
                  <td><strong>${r.dept.name}</strong></td>
                  <td>${r.purchased}</td>
                  <td>${r.activeSeats} (${r.licenseActivePct}%)</td>
                  <td><strong class="${r.unusedLicenses >= 20 ? 'text-red' : ''}">${r.unusedLicenses}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // 5. BUDGET
  // ==========================================================================
  function renderBudget(metrics) {
    const role = S.getRole();
    const showFin = S.canViewFinancials();
    if (!showFin) {
      return `<div class="page-stack"><div class="card card-lg empty-clean"><span>${t('ceo_fin_only')}</span></div></div>`;
    }

    const level = metrics.budgetUsedPct > 95 ? 'red' : metrics.budgetUsedPct > 80 ? 'yellow' : 'green';
    const spendTotal = Math.max(1, metrics.totalSpendMo);
    const items = [
      { label: t('ai_licenses'), value: metrics.licenseSpendMo, pct: Math.round((metrics.licenseSpendMo / spendTotal) * 100), color: '#3B82F6' },
      { label: `${t('api_tokens')} (${metrics.totalTokensM}M)`, value: metrics.tokenSpendMo, pct: Math.round((metrics.tokenSpendMo / spendTotal) * 100), color: '#8B5CF6' },
      { label: t('approved_projects'), value: metrics.projectSpendMo, pct: Math.round((metrics.projectSpendMo / spendTotal) * 100), color: '#10B981' },
      { label: t('approved_trainings'), value: metrics.trainingSpendMo, pct: Math.round((metrics.trainingSpendMo / spendTotal) * 100), color: '#F59E0B' }
    ];

    const tokenRows = metrics.rows.slice().sort((a, b) => b.tokensM - a.tokensM);

    return `
      <div class="page-stack">
        <div class="hero-row">
          <div class="card card-lg">
            <div class="panel-head">
              <h3>${metrics.tf.label} · ${t('nav_budget')}</h3>
              <span class="pill pill-${level}">${dot(level)} ${metrics.budgetUsedPct}%</span>
            </div>
            <div class="hero-main">
              <span class="big-num">${eur(metrics.totalSpendMo)}</span>
              <span class="muted-lg">/ ${eur(metrics.budgetLimit)}</span>
            </div>
            ${renderProgressLine({ pct: metrics.budgetUsedPct, targetPct: 100, level })}
            <div class="hero-sub">
              <span>${metrics.budgetUsedPct}% ${t('spent')}</span>
              <strong class="${metrics.budgetRemaining < 0 ? 'text-red' : 'text-green'}">
                ${metrics.budgetRemaining >= 0 ? `${eur(metrics.budgetRemaining)} ${t('left')}` : `${eur(Math.abs(metrics.budgetRemaining))} ${t('over')}`}
              </strong>
            </div>
          </div>

          <div class="card card-lg">
            <div class="panel-head">
              <h3>${t('increase_budget')}</h3>
              ${role.isCEO ? `<button type="button" class="link-btn" data-action="reset-budget">${t('reset')}</button>` : ''}
            </div>
            ${role.isCEO ? `
              <div class="quick-budget-btns">
                <button type="button" class="btn-budget-add" data-budget-add="2500">+ €2,500</button>
                <button type="button" class="btn-budget-add" data-budget-add="5000">+ €5,000</button>
                <button type="button" class="btn-budget-add" data-budget-add="10000">+ €10,000</button>
              </div>
              <form id="budget-form" class="budget-inline-form">
                <input type="number" name="budgetAmount" value="${S.state.monthlyBudget}" min="5000" step="1000" aria-label="Budget">
                <button type="submit" class="btn-primary">${t('save')}</button>
              </form>
            ` : `
              <div class="empty-clean" style="color:var(--text-2);"><span>${t('ceo_only')}</span></div>
            `}
          </div>
        </div>

        <div class="hero-row">
          <!-- Spend Breakdown -->
          <div class="card card-lg">
            <div class="panel-head"><h3>${t('spend_breakdown')} (${metrics.tf.label})</h3></div>
            <div class="funnel-simple">
              ${items.map(it => `
                <div class="funnel-step">
                  <div class="funnel-meta">
                    <span>${it.label}</span>
                    <strong>${eur(it.value)} <span class="muted">(${it.pct}%)</span></strong>
                  </div>
                  <div class="funnel-track">
                    <div class="funnel-fill" style="width:${Math.max(4, it.pct)}%;background:${it.color};"></div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Token Usage & Cost -->
          <div class="card card-lg">
            <div class="panel-head">
              <h3>${t('token_usage_cost')}</h3>
              <span class="muted-sm">${eur(metrics.avgTokenRate)} ${t('per_1m')}</span>
            </div>
            <div class="hero-main" style="margin-bottom:14px;">
              <span class="kpi-num">${metrics.totalTokensM}M</span>
              <span class="muted-lg">${eur(metrics.tokenSpendMo)}</span>
            </div>
            <table class="clean-table">
              <thead><tr><th>${t('dept_col')}</th><th>${t('tokens_col')}</th><th>${t('cost_col')}</th></tr></thead>
              <tbody>
                ${tokenRows.map(r => `
                  <tr>
                    <td><strong>${r.dept.name}</strong></td>
                    <td>${r.tokensM}M</td>
                    <td><strong>${eur(r.tokenCostMo)}</strong></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // 6. DEPARTMENTS — Clear Metric Title + Dept-Reactive 2026 Progress Graph
  // ==========================================================================
  function renderDepartments(metrics) {
    const role = S.getRole();

    const bmDefs = [
      { id: 'weeklyPct',  label: t('weekly'),  title: t('metric_weekly'),  trendKey: 'weekly',  target: D.TARGETS.weeklyPct,   max: 100, unit: '%' },
      { id: 'dailyPct',   label: t('daily'),   title: t('metric_daily'),   trendKey: 'daily',   target: D.TARGETS.dailyPct,    max: 100, unit: '%' },
      { id: 'trainedPct', label: t('trained'), title: t('metric_trained'), trendKey: 'trained', target: D.TARGETS.trainingPct, max: 100, unit: '%' }
    ];
    const bm = bmDefs.find(b => b.id === S.state.benchMetric) || bmDefs[0];

    const deptMetrics = D.DEPARTMENTS.map(dept => {
      const allowed = S.canViewDept(dept.id);
      const isOwn = !role.isCEO && role.ownDepts.includes(dept.id);
      if (!allowed) return { id: dept.id, label: dept.name, vp: dept.vp, value: 0, display: '—', level: 'muted', locked: true, isOwn };
      const dm = S.computeDept(dept, metrics.tf);
      const val = dm[bm.id];
      return { id: dept.id, label: dept.name, vp: dept.vp, value: val, display: `${val}%`, level: S.getStatus(val, bm.target).level, locked: false, isOwn, gap: val - bm.target };
    });

    const visibleRanked = deptMetrics.filter(d => !d.locked).sort((a, b) => b.value - a.value);
    const leader = visibleRanked[0];
    const lagging = visibleRanked[visibleRanked.length - 1];

    // Trend dynamically reacts to selected department (global filter OR clicked bar!)
    const tmKey = S.state.trendMetric;
    const trendData = S.computeTrendSeries(tmKey);
    const trendMetricTitle = tmKey === 'daily' ? t('metric_daily') : tmKey === 'trained' ? t('metric_trained') : t('metric_weekly');

    return `
      <div class="page-stack">
        <div class="split-2">
          <div class="card card-lg">
            <div class="panel-head panel-head-nowrap">
              <h3>${bm.title}</h3>
              <div class="seg-group">
                ${bmDefs.map(b => `<button type="button" class="seg-btn ${bm.id === b.id ? 'active' : ''}" data-bench-metric="${b.id}">${b.label}</button>`).join('')}
              </div>
            </div>
            ${C.renderTargetBars({
              items: deptMetrics,
              max: bm.max,
              target: bm.target,
              unit: bm.unit,
              clickableAttr: 'data-select-trend-dept',
              selectedId: trendData.activeDeptId
            })}
          </div>

          <div class="card card-lg">
            <div class="panel-head">
              <h3>${t('summary')}</h3>
              <span class="muted-sm">${t('target')} ${bm.target}%</span>
            </div>
            <div class="summary-highlights">
              ${leader ? `
                <div class="highlight-tile highlight-green">
                  <span class="outcome-lbl">${t('leading')}</span>
                  <strong>${leader.label} · ${leader.display}</strong>
                  <span class="muted-sm">${leader.vp}</span>
                </div>
              ` : ''}
              ${lagging && lagging !== leader ? `
                <div class="highlight-tile highlight-red">
                  <span class="outcome-lbl">${t('lagging')}</span>
                  <strong>${lagging.label} · ${lagging.display}</strong>
                  <span class="muted-sm">${lagging.vp}</span>
                </div>
              ` : ''}
            </div>
            <div class="dept-vp-list">
              ${visibleRanked.map(d => `
                <button type="button" class="dept-vp-row dept-vp-btn ${trendData.activeDeptId === d.id ? 'is-active' : ''}" data-select-trend-dept="${d.id}">
                  <span><strong>${d.label}</strong> <span class="muted-sm">· ${d.vp}</span></span>
                  <strong class="text-${d.level}">${d.gap >= 0 ? '+' : ''}${d.gap}%</strong>
                </button>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Department-Reactive 2026 Progress Graph -->
        <div class="card card-lg">
          <div class="panel-head">
            <div class="panel-head-left">
              <div>
                <h3>${t('progress_2026')} · <span class="text-blue">${trendData.scopeLabel}</span></h3>
                <span class="muted-sm">${trendMetricTitle}</span>
              </div>
              ${S.state.selectedTrendDept && S.state.filters.dept === 'all' ? `
                <button type="button" class="btn-subtle-xs" data-select-trend-dept="all">${t('all_depts_short')} ✕</button>
              ` : ''}
            </div>
            <div class="seg-group">
              <button type="button" class="seg-btn ${tmKey === 'weekly' ? 'active' : ''}" data-trend-metric="weekly">${t('weekly')}</button>
              <button type="button" class="seg-btn ${tmKey === 'daily' ? 'active' : ''}" data-trend-metric="daily">${t('daily')}</button>
              <button type="button" class="seg-btn ${tmKey === 'trained' ? 'active' : ''}" data-trend-metric="trained">${t('trained')}</button>
            </div>
          </div>
          ${C.renderTrendLine({
            labels: trendData.labels,
            actual: trendData.actual,
            target: trendData.target,
            unit: '%', min: 0, max: 100
          })}
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // 7. CULTURE — Monthly 5-Question Pulse, Tool Wishes & 2026 Trend
  // ==========================================================================
  function renderCulture() {
    const c = S.computeCulture();
    const maxVotes = Math.max(1, c.wishRanking[0]?.votes || 1);

    return `
      <div class="page-stack">
        <div class="hero-row">
          <!-- Left: 5 Monthly Survey Questions -->
          <div class="card card-lg">
            <div class="panel-head">
              <h3>${t('culture_pulse')}</h3>
              <span class="muted-sm">${c.totalResponses} / ${c.totalEmp} (${c.responsePct}%)</span>
            </div>
            <div class="funnel-simple">
              ${c.questions.map(q => {
                const st = S.getStatus(q.pct, 75);
                return `
                  <div class="funnel-step">
                    <div class="funnel-meta">
                      <span>${q.label}</span>
                      <strong class="text-${st.level}">${q.pct}%</strong>
                    </div>
                    <div class="funnel-track">
                      <div class="funnel-fill fill-${st.level}" style="width:${q.pct}%;"></div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Right: Most Requested AI Tools Ranking -->
          <div class="card card-lg">
            <div class="panel-head">
              <h3>${t('culture_wishes')}</h3>
              <span class="muted-sm">${c.tf.label}</span>
            </div>
            <div class="wish-list">
              ${c.wishRanking.map((w, idx) => `
                <div class="wish-row">
                  <span class="wish-rank">#${idx + 1}</span>
                  <div class="wish-main">
                    <div class="funnel-meta" style="margin-bottom:5px;">
                      <strong>${w.name}</strong>
                      <span class="muted-sm"><strong>${w.votes}</strong> ${t('votes')}</span>
                    </div>
                    <div class="funnel-track" style="height:10px;">
                      <div class="funnel-fill" style="width:${Math.max(8, Math.round((w.votes / maxVotes) * 100))}%;background:#3B82F6;"></div>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Bottom: Culture Score Over Time (Jan–Nov 2026) -->
        <div class="card card-lg">
          <div class="panel-head">
            <h3>${t('culture_trend')}</h3>
            <span class="muted-sm">${c.trend.scopeLabel} · ${c.overallPct}% Ø</span>
          </div>
          ${C.renderTrendLine({
            labels: c.trend.labels,
            actual: c.trend.actual,
            target: c.trend.target,
            unit: '%',
            min: 30,
            max: 100
          })}
        </div>
      </div>
    `;
  }

  // --- Settings Gear Popover (Theme + Language) ---
  function renderSettingsMenu() {
    if (!S.state.showSettings) return '';
    return `
      <div class="settings-panel">
        <div class="settings-row">
          <span class="settings-lbl">${t('appearance')}</span>
          <div class="seg-group">
            <button type="button" class="seg-btn ${S.state.theme === 'light' ? 'active' : ''}" data-set-theme="light">${t('light')}</button>
            <button type="button" class="seg-btn ${S.state.theme === 'dark' ? 'active' : ''}" data-set-theme="dark">${t('dark')}</button>
          </div>
        </div>
        <div class="settings-row">
          <span class="settings-lbl">${t('language')}</span>
          <div class="seg-group">
            <button type="button" class="seg-btn ${S.state.lang === 'en' ? 'active' : ''}" data-set-lang="en">EN</button>
            <button type="button" class="seg-btn ${S.state.lang === 'de' ? 'active' : ''}" data-set-lang="de">DE</button>
          </div>
        </div>
      </div>
    `;
  }

  // --- Modals ---
  function renderProjectModal() {
    if (!S.state.showProjectModal) return '';
    const role = S.getRole();
    const depts = role.isCEO ? D.DEPARTMENTS : D.DEPARTMENTS.filter(d => role.ownDepts.includes(d.id));
    return `
      <div class="modal-backdrop">
        <div class="modal-card">
          <div class="panel-head">
            <h3>${t('new_project').replace('+ ', '')}</h3>
          </div>
          <form id="project-form" class="clean-form">
            <label><span>${t('project_name')}</span><input type="text" name="name" required></label>
            <label><span>${t('dept_col')}</span><select name="deptId">${depts.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}</select></label>
            <label><span>${t('expected_outcome')}</span><input type="text" name="outcome" required></label>
            <div class="form-row-2">
              <label><span>${t('budget_eur')}</span><input type="number" name="budget" placeholder="25000" min="0" step="1000"></label>
              <label><span>${t('timeline')}</span><input type="text" name="timeline" value="Q1 2027"></label>
            </div>
            <div class="form-actions">
              <button type="button" class="btn-secondary" data-action="close-modal">${t('cancel')}</button>
              <button type="submit" class="btn-primary">${role.isCEO ? t('approve') : t('submit')}</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  function renderTrainingModal() {
    if (!S.state.showTrainingModal) return '';
    const role = S.getRole();
    const depts = role.isCEO ? D.DEPARTMENTS : D.DEPARTMENTS.filter(d => role.ownDepts.includes(d.id));
    return `
      <div class="modal-backdrop">
        <div class="modal-card">
          <div class="panel-head">
            <h3>${t('request_training').replace('+ ', '')}</h3>
          </div>
          <form id="training-form" class="clean-form">
            <label><span>${t('title')}</span><input type="text" name="name" required></label>
            <div class="form-row-2">
              <label><span>${t('dept_col')}</span><select name="deptId">${depts.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}</select></label>
              <label><span>${t('employees')}</span><input type="number" name="participants" value="15" min="1" max="100"></label>
            </div>
            <label><span>${t('expected_outcome')}</span><input type="text" name="outcome" required></label>
            <div class="form-row-2">
              <label><span>${t('budget_eur')}</span><input type="number" name="budget" placeholder="6000" min="0" step="500"></label>
              <label><span>${t('timeline')}</span><input type="text" name="timeline" value="Q1 2027"></label>
            </div>
            <div class="form-actions">
              <button type="button" class="btn-secondary" data-action="close-modal">${t('cancel')}</button>
              <button type="submit" class="btn-primary">${role.isCEO ? t('approve') : t('submit')}</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  return {
    renderOverview, renderReadiness, renderProjects, renderTrainings, renderLicenses, renderBudget, renderDepartments, renderCulture,
    renderSettingsMenu, renderProjectModal, renderTrainingModal
  };
})();
