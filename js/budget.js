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

  function verdict(all, sharePct, ratio, C) {
    const [lo, hi] = C.bench.shareOfRevenue;
    const peerHighMo = (C.revenueYear / 12) * hi / 100;
    if (all.budgetUsedPct > 100) {
      return { level: 'red', text: `<strong>Over budget.</strong> AI spend exceeds the monthly budget by ${eur(-all.budgetRemaining)} — decide: raise the budget or pause the lowest-return spend.` };
    }
    if (ratio < 1) {
      return { level: 'red', text: `<strong>Not paying off yet.</strong> AI returns only ${ratio.toFixed(1)}× its cost — fix adoption before adding budget.` };
    }
    if (sharePct < lo) {
      return { level: 'yellow', text: `<strong>Under-invested.</strong> AI returns ${ratio.toFixed(1)}× its cost but spend is below peers (${fmtPct(sharePct)} of revenue) — scaling up is likely worth it.` };
    }
    if (sharePct > hi) {
      return { level: 'yellow', text: `<strong>Above peers.</strong> Spend is ${fmtPct(sharePct)} of revenue (peers ≤ ${hi}%) — keep the budget flat and cut low-return spend first.` };
    }
    return {
      level: 'green',
      text: `<strong>Right-sized and paying off.</strong> AI returns <strong>${ratio.toFixed(1)}×</strong> its cost and spend sits mid-range for peers (${fmtPct(sharePct)} of revenue). Room to scale to <strong>${eurK(peerHighMo)}/mo</strong> (peer upper end) as pilots prove out.`
    };
  }

  function render() {
    const role = S.getRole();
    const all = withFilters({ dept: 'all' }, m => m);
    const rows = deptRows();
    const sel = S.state.filters.dept;
    const C = D.COMPANY;
    const revMo = C.revenueYear / 12;
    const share = pct(all.totalSpendMo, revMo);
    const budgetShare = pct(all.budgetLimit, revMo);
    const ratio = all.costSavedMo / Math.max(1, all.totalSpendMo);
    const v = verdict(all, share, ratio, C);
    const level = all.budgetUsedPct > 100 ? 'red' : all.budgetUsedPct > 90 ? 'yellow' : 'green';
    const [lo, hi] = C.bench.shareOfRevenue;
    const SCALE = 1.2; // % of revenue shown on the peer scale
    const at = (p) => Math.min(100, (p / SCALE) * 100);
    const maxCV = Math.max(all.totalSpendMo, all.costSavedMo);
    const tips = insights(rows).slice(0, 2);
    const editing = !!S.state.budgetEdit;

    return `
      <div class="b2">
        <div class="b2-head">
          <span class="b2-q">Is our AI budget right-sized?</span>
          ${role.isCEO ? `
            <div class="b2-adjust">
              <button type="button" class="b2-adjust-btn ${editing ? 'is-open' : ''}" data-action="budget-edit">Adjust budget</button>
              ${editing ? `
                <div class="b2-adjust-pop">
                  <span class="bg-lbl">Monthly AI budget</span>
                  <form id="budget-form" class="b2-form">
                    <input type="number" name="budgetAmount" value="${S.state.monthlyBudget}" min="5000" step="500" aria-label="Monthly budget">
                    <button type="submit" class="btn-primary-sm">Save</button>
                  </form>
                  <div class="b2-quick">
                    <button type="button" class="bg-chip" data-budget-add="2500">+ €2.5k</button>
                    <button type="button" class="bg-chip" data-budget-add="5000">+ €5k</button>
                    <button type="button" class="bg-chip" data-action="reset-budget">Reset €32k</button>
                  </div>
                </div>
              ` : ''}
            </div>
          ` : ''}
        </div>

        <!-- 1 · The big picture -->
        <section class="b2-hero">
          <div class="b2-col">
            <span class="bg-lbl">AI spend · ${all.tf.label}</span>
            <div class="b2-big">${eurK(all.totalSpendMo)}<small>/mo</small></div>
            <div class="b2-sub">${eurK(all.totalSpendMo * 12)} per year · ${fmtPct(share)} of revenue</div>
            <div class="b2-budget">
              <div class="b2-budget-bar"><div class="bg-${level}" style="width:${Math.min(100, all.budgetUsedPct)}%"></div></div>
              <div class="b2-budget-meta"><span><strong>${all.budgetUsedPct}%</strong> of ${eurK(all.budgetLimit)} budget</span><span class="${all.budgetRemaining >= 0 ? 'text-green' : 'text-red'}">${eurK(Math.abs(all.budgetRemaining))} ${all.budgetRemaining >= 0 ? 'left' : 'over'}</span></div>
            </div>
          </div>

          <div class="b2-col">
            <span class="bg-lbl">Cost vs value · per month</span>
            <div class="b2-cv">
              <div class="b2-cv-row"><span>AI cost</span><div class="b2-cv-track"><div style="width:${(all.totalSpendMo / maxCV) * 100}%;background:#3B82F6"></div></div><strong>${eurK(all.totalSpendMo)}</strong></div>
              <div class="b2-cv-row"><span>AI value</span><div class="b2-cv-track"><div style="width:${(all.costSavedMo / maxCV) * 100}%;background:#10B981"></div></div><strong>${eurK(all.costSavedMo)}</strong></div>
            </div>
            <div class="b2-ratio"><strong class="${ratio >= 1 ? 'text-green' : 'text-red'}">${ratio.toFixed(1)}×</strong> return on every euro</div>
          </div>

          <div class="b2-col">
            <span class="bg-lbl">Vs. peers · AI spend as % of revenue</span>
            <div class="b2-scale">
              <div class="b2-scale-track">
                <div class="b2-band" style="left:${at(lo)}%;width:${at(hi) - at(lo)}%" title="Peer range ${lo}–${hi}%"></div>
                <div class="b2-mark b2-mark-budget" style="left:${at(budgetShare)}%"><span>budget</span></div>
                <div class="b2-mark b2-mark-now" style="left:${at(share)}%"><span>NuTex ${fmtPct(share)}</span></div>
              </div>
              <div class="b2-scale-ticks">${[0, 0.4, 0.8, 1.2].map(t => `<span style="left:${at(t)}%">${t}%</span>`).join('')}</div>
            </div>
            <div class="b2-sub"><i class="b2-band-key"></i>peer range ${lo}–${hi}% · ${eur(all.totalSpendMo / all.totalEmp)} per employee (peers €${C.bench.perEmpMo[0]}–${C.bench.perEmpMo[1]})</div>
          </div>
        </section>
        <div class="b2-verdict b2-verdict-${v.level}">${v.text}</div>

        <!-- 2 · Per department -->
        <div class="b2-sec-head">
          <span class="b2-sec-title">By department</span>
          <span class="b2-sec-sub">spent vs. budget this month · value per € spent</span>
        </div>
        <div class="b2-depts">
          ${rows.map(r => {
            const lv = r.used > 100 ? 'red' : r.used >= 95 ? 'yellow' : 'green';
            const tag = r.used > 100 ? 'Over' : r.used >= 95 ? 'Tight' : r.used < 80 ? 'Headroom' : '';
            return `
              <div class="b2-dept ${sel === r.id ? 'is-sel' : ''}" title="Licenses ${eur(r.parts.licenses)} · Tokens ${eur(r.parts.tokens)} · Projects ${eur(r.parts.projects)} · Trainings ${eur(r.parts.trainings)} · ${eur(r.perEmp)} per employee">
                <div class="b2-dept-top">
                  <strong>${r.name}</strong>
                  ${tag ? `<span class="b2-tag b2-tag-${lv}">${tag}</span>` : ''}
                </div>
                <div class="b2-dept-amt"><strong>${k1(r.spent)}</strong> <span>of ${k1(r.budget)}</span></div>
                <div class="b2-dept-bar"><div class="bg-${lv}" style="width:${Math.min(100, r.used)}%"></div></div>
                <div class="b2-dept-foot">
                  <span class="text-${lv}">${r.used}% used</span>
                  <span>€${r.vpe.toFixed(2)} <em>per €</em></span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
        ${tips.length ? `<div class="b2-tips">${tips.map(t => `<div class="bg-tip bg-tip-${t.level}">${t.text}</div>`).join('')}</div>` : ''}
      </div>
    `;
  }

  return { render };
})();
