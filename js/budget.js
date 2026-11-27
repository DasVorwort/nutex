/* ============================================================================
   NuTex Inc. — Level 2: Budget
   1) This month's AI spend vs budget (+ trend)
   2) Budget per department: allocation, spend, utilization, € per employee,
      value per € — and derived recommendations
   3) AI spend in the company context (revenue → IT budget → AI → value)
   ============================================================================ */

window.NUTEX_BUDGET = (() => {
  const D = window.NUTEX_DATA;
  const S = window.NUTEX_STATE;

  const eur = (n) => '€' + Math.round(n).toLocaleString('en-US');
  const eurK = (n) => {
    const a = Math.abs(n);
    if (a >= 1e6) return `€${(n / 1e6).toFixed(a >= 1e7 ? 0 : 2).replace(/\.?0+$/, '')}M`;
    if (a >= 1e4) return `€${(n / 1e3).toFixed(1).replace(/\.0$/, '')}k`;
    return eur(n);
  };
  const pct = (n, d) => (d ? (n / d) * 100 : 0);
  const k1 = (n) => `€${(n / 1000).toFixed(1)}k`;
  const fmtPct = (v) => (v < 1 ? v.toFixed(2) : v < 10 ? v.toFixed(1) : Math.round(v)) + '%';

  // Re-compute metrics for another filter state, then restore
  function withFilters(patch, fn) {
    const saved = { ...S.state.filters };
    Object.assign(S.state.filters, patch);
    try { return fn(S.computeMetrics()); } finally { S.state.filters = saved; }
  }

  function deptRows() {
    return S.getAccessibleDepts().map(d => withFilters({ dept: d.id }, m => ({
      id: d.id,
      name: d.name,
      vp: d.vp,
      employees: d.employees,
      budget: m.budgetLimit,
      spent: m.totalSpendMo,
      used: m.budgetUsedPct,
      perEmp: m.totalSpendMo / d.employees,
      value: m.costSavedMo,
      vpe: m.costSavedMo / Math.max(1, m.totalSpendMo),
      parts: { licenses: m.licenseSpendMo, tokens: m.tokenSpendMo, projects: m.projectSpendMo, trainings: m.trainingSpendMo },
      unusedCost: m.unusedCostMo
    })));
  }

  function insights(rows) {
    const out = [];
    const over = rows.filter(r => r.used > 100).sort((a, b) => b.used - a.used);
    const tight = rows.filter(r => r.used >= 95 && r.used <= 100).sort((a, b) => b.used - a.used);
    const room = rows.filter(r => r.used < 85).sort((a, b) => b.vpe - a.vpe);
    const waste = rows.slice().sort((a, b) => b.unusedCost - a.unusedCost)[0];
    const best = rows.slice().sort((a, b) => b.vpe - a.vpe)[0];

    if (over.length) {
      out.push({ level: 'red', text: `<strong>${over.map(r => r.name).join(', ')}</strong> over budget by ${eur(over.reduce((s, r) => s + r.spent - r.budget, 0))} this month.` });
    }
    if (room[0] && (tight.length || over.length)) {
      const from = room[0];
      const to = (over[0] || tight[0]);
      const amount = Math.round(Math.min(from.budget - from.spent, Math.max(500, to.spent - to.budget + to.budget * 0.05)) / 100) * 100;
      out.push({ level: 'yellow', text: `Shift <strong>${eur(amount)}/mo</strong> from ${from.name} (${from.used}% used) to ${to.name} (${to.used}% used).` });
    } else if (room[0]) {
      out.push({ level: 'green', text: `<strong>${room[0].name}</strong> has ${eur(room[0].budget - room[0].spent)} headroom at €${room[0].vpe.toFixed(2)} per € — room to fund its next pilot.` });
    }
    const avgEmp = rows.reduce((s, r) => s + r.spent, 0) / Math.max(1, rows.reduce((s, r) => s + r.employees, 0));
    const avgVpe = rows.reduce((s, r) => s + r.value, 0) / Math.max(1, rows.reduce((s, r) => s + r.spent, 0));
    const costly = rows.filter(r => r.perEmp > avgEmp * 1.6 && r.vpe < avgVpe).sort((a, b) => b.perEmp - a.perEmp)[0];
    if (costly) out.push({ level: 'yellow', text: `<strong>${costly.name}</strong> spends ${eur(costly.perEmp)} per employee (${(costly.perEmp / avgEmp).toFixed(1)}× average) but returns only €${costly.vpe.toFixed(2)} per € — review its tool mix.` });
    if (waste && waste.unusedCost > 300) out.push({ level: 'yellow', text: `${eur(waste.unusedCost)}/mo goes to unused licenses in <strong>${waste.name}</strong> — reallocate before raising budget.` });
    if (best) out.push({ level: 'green', text: `Best return: <strong>${best.name}</strong> at €${best.vpe.toFixed(2)} value per € spent.` });
    return out.slice(0, 3);
  }

  function spark(values, budget) {
    const w = 260;
    const h = 54;
    const hi = Math.max(...values, budget) * 1.08;
    const x = (i) => 2 + (i / Math.max(1, values.length - 1)) * (w - 6);
    const y = (v) => h - 2 - (v / hi) * (h - 6);
    const pts = values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
    return `
      <svg class="bg-spark" viewBox="0 0 ${w} ${h}" aria-hidden="true">
        <line x1="0" x2="${w}" y1="${y(budget)}" y2="${y(budget)}" stroke="var(--text-3)" stroke-dasharray="4 3" stroke-width="1"/>
        <text x="${w - 2}" y="${y(budget) - 4}" text-anchor="end" font-size="9.5" fill="var(--text-3)">budget</text>
        <polygon points="2,${h} ${pts} ${x(values.length - 1)},${h}" fill="rgba(59,130,246,0.12)"/>
        <polyline points="${pts}" fill="none" stroke="#3B82F6" stroke-width="2" stroke-linejoin="round"/>
        <circle cx="${x(values.length - 1)}" cy="${y(values[values.length - 1])}" r="3.2" fill="#3B82F6"/>
      </svg>
    `;
  }

  function render(metrics) {
    const role = S.getRole();
    const all = withFilters({ dept: 'all' }, m => m);
    const rows = deptRows();
    const sel = S.state.filters.dept;
    const keys = D.TREND_2026.keys;
    const idx = Math.max(0, keys.indexOf(S.state.filters.timeframe));
    const series = keys.slice(0, idx + 1).map(k => withFilters({ timeframe: k, dept: 'all' }, m => m.totalSpendMo));
    const level = all.budgetUsedPct > 100 ? 'red' : all.budgetUsedPct > 85 ? 'yellow' : 'green';

    const maxScale = Math.max(...rows.map(r => Math.max(r.budget, r.spent))) * 1.04;
    const C = D.COMPANY;
    const revMo = C.revenueYear / 12;
    const itMo = revMo * C.itBudgetPct / 100;
    const aiShareRev = pct(all.totalSpendMo, revMo);
    const aiShareIt = pct(all.totalSpendMo, itMo);
    const perEmp = all.totalSpendMo / all.totalEmp;
    const ratio = all.costSavedMo / Math.max(1, all.totalSpendMo);
    const cats = [
      { label: 'Licenses', v: all.licenseSpendMo, c: '#3B82F6' },
      { label: 'API tokens', v: all.tokenSpendMo, c: '#8B5CF6' },
      { label: 'Projects', v: all.projectSpendMo, c: '#10B981' },
      { label: 'Trainings', v: all.trainingSpendMo, c: '#F59E0B' }
    ];
    const bench = (val, lo, hi) => val < lo ? { t: 'below range', l: 'yellow' } : val > hi ? { t: 'above range', l: 'red' } : { t: 'in range', l: 'green' };
    const bEmp = bench(perEmp, C.bench.perEmpMo[0], C.bench.perEmpMo[1]);
    const bIt = bench(aiShareIt, C.bench.shareOfIt[0], C.bench.shareOfIt[1]);
    const bRev = bench(aiShareRev, C.bench.shareOfRevenue[0], C.bench.shareOfRevenue[1]);
    const tips = insights(rows);

    return `
      <div class="bg-wrap">
        <!-- 1 · This month -->
        <div class="bg-top">
          <div class="bg-kpi">
            <span class="bg-lbl">AI spend · ${all.tf.label}</span>
            <div class="bg-big">${eur(all.totalSpendMo)}<small> / ${eur(all.budgetLimit)}</small></div>
            <div class="bg-bar"><div class="bg-bar-fill bg-${level}" style="width:${Math.min(100, all.budgetUsedPct)}%"></div></div>
            <div class="bg-meta"><span><strong>${all.budgetUsedPct}%</strong> used</span><span class="${all.budgetRemaining >= 0 ? 'text-green' : 'text-red'}"><strong>${eur(Math.abs(all.budgetRemaining))}</strong> ${all.budgetRemaining >= 0 ? 'left' : 'over'}</span></div>
          </div>
          <div class="bg-trend">
            <span class="bg-lbl">Monthly spend · Jan → ${all.tf.label.split(' ')[0]}</span>
            ${spark(series, all.budgetLimit)}
          </div>
          <div class="bg-cats">
            <span class="bg-lbl">Where it goes</span>
            <div class="bg-stack">${cats.map(c => `<div style="flex:${Math.max(0.001, c.v)};background:${c.c}" title="${c.label}: ${eur(c.v)}"></div>`).join('')}</div>
            <div class="bg-cat-legend">${cats.map(c => `<span><i style="background:${c.c}"></i>${c.label} <strong>${eurK(c.v)}</strong></span>`).join('')}</div>
          </div>
          ${role.isCEO ? `
            <div class="bg-adjust">
              <span class="bg-lbl">Monthly budget</span>
              <div class="bg-adjust-row">
                <button type="button" class="bg-chip" data-budget-add="2500">+ €2.5k</button>
                <button type="button" class="bg-chip" data-budget-add="5000">+ €5k</button>
                <button type="button" class="bg-chip" data-action="reset-budget">Reset</button>
              </div>
            </div>
          ` : ''}
        </div>

        <div class="bg-grid">
          <!-- 2 · Per department -->
          <section class="bg-panel">
            <div class="bg-panel-head">
              <h4>Budget per department</h4>
              <span class="bg-legend"><i class="bg-key-spent"></i>spent <i class="bg-key-budget"></i>budget</span>
            </div>
            <div class="bg-table">
              <div class="bg-tr bg-th"><span>Department</span><span>Spent vs budget</span><span>Used</span><span>€ / emp.</span><span>Value / €</span></div>
              ${rows.map(r => {
                const lv = r.used > 100 ? 'red' : r.used >= 95 ? 'yellow' : 'green';
                const bw = (r.budget / maxScale) * 100;
                const sw = (Math.min(r.spent, r.budget) / maxScale) * 100;
                const ow = (Math.max(0, r.spent - r.budget) / maxScale) * 100;
                return `
                  <div class="bg-tr ${sel === r.id ? 'is-sel' : ''}" title="${r.name}: ${eur(r.spent)} of ${eur(r.budget)} · licenses ${eur(r.parts.licenses)}, tokens ${eur(r.parts.tokens)}, projects ${eur(r.parts.projects)}, trainings ${eur(r.parts.trainings)}">
                    <span class="bg-dept"><strong>${r.name}</strong><small>${r.employees} emp.</small></span>
                    <span class="bg-track-wrap">
                      <span class="bg-track" style="width:${bw}%"></span>
                      <span class="bg-fill bg-${lv}" style="width:${sw}%"></span>
                      ${ow ? `<span class="bg-over" style="left:${bw}%;width:${ow}%"></span>` : ''}
                      <span class="bg-amt">${k1(r.spent)} <em>/ ${k1(r.budget)}</em></span>
                    </span>
                    <strong class="text-${lv}">${r.used}%</strong>
                    <span>${eur(r.perEmp)}</span>
                    <strong class="${r.vpe >= 2 ? 'text-green' : r.vpe >= 1 ? '' : 'text-red'}">€${r.vpe.toFixed(2)}</strong>
                  </div>
                `;
              }).join('')}
            </div>
            <div class="bg-tips">
              ${tips.map(t => `<div class="bg-tip bg-tip-${t.level}">${t.text}</div>`).join('')}
            </div>
          </section>

          <!-- 3 · Company context -->
          <section class="bg-panel">
            <div class="bg-panel-head">
              <h4>AI in the company context</h4>
              <span class="bg-legend">per month</span>
            </div>
            <div class="bg-zoom">
              <div class="bg-step">
                <span class="bg-step-lbl">Revenue</span>
                <strong>${eurK(revMo)}</strong>
                <span class="bg-step-bar"><i style="width:100%"></i></span>
                <span class="bg-step-share">${eurK(C.revenueYear)} / year</span>
              </div>
              <div class="bg-step">
                <span class="bg-step-lbl">IT budget</span>
                <strong>${eurK(itMo)}</strong>
                <span class="bg-step-bar"><i style="width:${C.itBudgetPct}%"></i></span>
                <span class="bg-step-share">${fmtPct(C.itBudgetPct)} of revenue</span>
              </div>
              <div class="bg-step is-ai">
                <span class="bg-step-lbl">AI spend</span>
                <strong>${eurK(all.totalSpendMo)}</strong>
                <span class="bg-step-bar"><i style="width:${Math.min(100, aiShareIt)}%"></i></span>
                <span class="bg-step-share">${fmtPct(aiShareIt)} of IT · ${fmtPct(aiShareRev)} of revenue</span>
              </div>
              <div class="bg-step is-value">
                <span class="bg-step-lbl">AI value</span>
                <strong>${eurK(all.costSavedMo)}</strong>
                <span class="bg-step-bar"><i style="width:${Math.min(100, (all.costSavedMo / Math.max(all.costSavedMo, all.totalSpendMo)) * 100)}%"></i></span>
                <span class="bg-step-share"><strong>${ratio.toFixed(1)}×</strong> the AI spend</span>
              </div>
            </div>
            <div class="bg-bench">
              <div><span>AI spend per employee</span><strong>${eur(perEmp)}</strong><small class="text-${bEmp.l}">${bEmp.t} · peers €${C.bench.perEmpMo[0]}–${C.bench.perEmpMo[1]}</small></div>
              <div><span>Share of IT budget</span><strong>${fmtPct(aiShareIt)}</strong><small class="text-${bIt.l}">${bIt.t} · peers ${C.bench.shareOfIt[0]}–${C.bench.shareOfIt[1]}%</small></div>
              <div><span>Share of revenue</span><strong>${fmtPct(aiShareRev)}</strong><small class="text-${bRev.l}">${bRev.t} · peers ${C.bench.shareOfRevenue[0]}–${C.bench.shareOfRevenue[1]}%</small></div>
            </div>
          </section>
        </div>
      </div>
    `;
  }

  return { render };
})();
