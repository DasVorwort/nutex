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

  function verdict(all, share, C, stats) {
    const [lo, hi] = C.bench.shareOfRevenue;
    const revMo = C.revenueYear / 12;
    const peerHighMo = revMo * hi / 100;
    if (all.budgetUsedPct > 100) {
      return { level: 'red', text: `<strong>Over budget.</strong> AI spend exceeds the monthly budget by ${eur(-all.budgetRemaining)} — raise the budget or pause low-return spend.` };
    }
    if (share < lo) {
      return { level: 'yellow', text: `<strong>Below peers.</strong> NuTex invests ${fmtPct(share)} of revenue in AI — less than most comparable companies (median ${fmtPct(stats.median)}).` };
    }
    if (share > hi) {
      return { level: 'yellow', text: `<strong>Above peers.</strong> At ${fmtPct(share)} of revenue NuTex spends more than the peer range (${lo}–${hi}%) — hold the budget flat.` };
    }
    return {
      level: 'green',
      text: `<strong>Within the peer range.</strong> NuTex invests <strong>${fmtPct(share)}</strong> of revenue in AI (peer median ${fmtPct(stats.median)}, rank ${stats.rank} of ${stats.n}). Up to <strong>${eurK(peerHighMo)}/mo</strong> would still be in range.`
    };
  }

  // Peer strip: every comparable company is a dot; NuTex and the budget are highlighted
  function peerChart(share, budgetShare, C, stats) {
    const W = 760;
    const H = 132;
    const L = 16;
    const R = 744;
    const MAX = 1.2;
    const x = (p) => L + (Math.min(p, MAX) / MAX) * (R - L);
    const yMid = 70;
    const [lo, hi] = C.bench.shareOfRevenue;
    const peers = C.peers.slice().sort((a, b) => a.share - b.share);
    // stack dots that sit close together
    const placed = [];
    const dots = peers.map(p => {
      const px = x(p.share);
      let lane = 0;
      while (placed.some(q => q.lane === lane && Math.abs(q.x - px) < 13)) lane++;
      placed.push({ x: px, lane });
      const py = yMid + (lane % 2 ? 1 : -1) * Math.ceil(lane / 2) * 13;
      return `<circle cx="${px}" cy="${py}" r="5.5" fill="#94A3B8" opacity="0.75"><title>${p.name}: ${p.share.toFixed(2)}% of revenue</title></circle>`;
    }).join('');
    const ticks = [0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2].map(t => `
      <line x1="${x(t)}" x2="${x(t)}" y1="${H - 26}" y2="${H - 21}" stroke="var(--text-3)"/>
      <text x="${x(t)}" y="${H - 8}" text-anchor="middle" font-size="10.5" fill="var(--text-3)">${t.toFixed(1)}%</text>
    `).join('');
    const bx = x(budgetShare);
    const nx = x(share);
    return `
      <svg class="b3-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="AI spend as share of revenue vs peers">
        <rect x="${x(0)}" y="34" width="${x(lo) - x(0)}" height="72" rx="8" fill="rgba(245,158,11,0.08)"/>
        <rect x="${x(lo)}" y="34" width="${x(hi) - x(lo)}" height="72" rx="8" fill="rgba(16,185,129,0.12)"/>
        <rect x="${x(hi)}" y="34" width="${x(MAX) - x(hi)}" height="72" rx="8" fill="rgba(239,68,68,0.07)"/>
        <text x="${(x(0) + x(lo)) / 2}" y="48" text-anchor="middle" font-size="10" font-weight="700" letter-spacing="0.06em" fill="var(--yellow-txt)" opacity="0.8">BELOW PEERS</text>
        <text x="${(x(lo) + x(hi)) / 2}" y="48" text-anchor="middle" font-size="10" font-weight="700" letter-spacing="0.06em" fill="var(--green-txt)" opacity="0.8">PEER RANGE ${lo}–${hi}%</text>
        <text x="${(x(hi) + x(MAX)) / 2}" y="48" text-anchor="middle" font-size="10" font-weight="700" letter-spacing="0.06em" fill="var(--red-txt)" opacity="0.7">ABOVE PEERS</text>
        <line x1="${L}" x2="${R}" y1="${H - 26}" y2="${H - 26}" stroke="var(--border-hover)"/>
        ${ticks}
        <line x1="${x(stats.median)}" x2="${x(stats.median)}" y1="54" y2="${H - 26}" stroke="var(--text-3)" stroke-dasharray="3 3"/>
        <text x="${x(stats.median)}" y="${H - 31}" text-anchor="middle" font-size="9.5" fill="var(--text-3)" dx="${Math.abs(x(stats.median) - nx) < 40 ? -28 : 0}">median</text>
        ${dots}
        <line x1="${bx}" x2="${bx}" y1="56" y2="${H - 26}" stroke="#2563EB" stroke-width="1.6" stroke-dasharray="4 3"/>
        <rect x="${bx - 34}" y="${H - 50}" width="68" height="17" rx="8.5" fill="var(--surface)" stroke="#2563EB"/>
        <text x="${bx}" y="${H - 41.5}" text-anchor="middle" dominant-baseline="central" font-size="10" font-weight="700" fill="#2563EB">budget ${fmtPct(budgetShare)}</text>
        <circle cx="${nx}" cy="${yMid}" r="10" fill="#0F172A" stroke="var(--surface)" stroke-width="3"/>
        <rect x="${nx - 44}" y="6" width="88" height="20" rx="10" fill="#0F172A"/>
        <text x="${nx}" y="16" text-anchor="middle" dominant-baseline="central" font-size="11" font-weight="800" fill="#FFFFFF">NuTex ${fmtPct(share)}</text>
        <line x1="${nx}" x2="${nx}" y1="26" y2="${yMid - 10}" stroke="#0F172A" stroke-width="1.5"/>
      </svg>
    `;
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
    const shares = C.peers.map(p => p.share).sort((a, b) => a - b);
    const median = shares.length % 2 ? shares[(shares.length - 1) / 2] : (shares[shares.length / 2 - 1] + shares[shares.length / 2]) / 2;
    const stats = { median, rank: shares.filter(s => s > share).length + 1, n: shares.length + 1 };
    const v = verdict(all, share, C, stats);
    const level = all.budgetUsedPct > 100 ? 'red' : all.budgetUsedPct > 90 ? 'yellow' : 'green';
    const tips = insights(rows).slice(0, 2);
    const editing = !!S.state.budgetEdit;

    return `
      <div class="b2">
        <div class="b2-head">
          <span class="b2-q">How much of our revenue do we invest in AI — and is that right?</span>
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

        <section class="b3-hero">
          <div class="b3-kpis">
            <div class="b3-kpi b3-kpi-main">
              <span class="bg-lbl">AI spend as share of revenue</span>
              <div class="b3-big">${fmtPct(share)}</div>
              <div class="b2-sub">${eurK(all.totalSpendMo)}/mo of ${eurK(revMo)} revenue · ${eurK(all.totalSpendMo * 12)} per year</div>
            </div>
            <div class="b3-kpi">
              <span class="bg-lbl">Budget ${all.tf.label}</span>
              <div class="b3-mid">${all.budgetUsedPct}%<small> used</small></div>
              <div class="b2-budget-bar"><div class="bg-${level}" style="width:${Math.min(100, all.budgetUsedPct)}%"></div></div>
              <div class="b2-sub">${eurK(all.totalSpendMo)} of ${eurK(all.budgetLimit)} · <span class="${all.budgetRemaining >= 0 ? 'text-green' : 'text-red'}">${eurK(Math.abs(all.budgetRemaining))} ${all.budgetRemaining >= 0 ? 'left' : 'over'}</span></div>
            </div>
          </div>
          <div class="b3-peers">
            <div class="b3-peers-head">
              <span class="bg-lbl">Vs. ${C.peers.length} comparable manufacturers</span>
              <span class="b2-sub">rank <strong>${stats.rank}</strong> of ${stats.n} · median ${fmtPct(median)} · ${eur(all.totalSpendMo / all.totalEmp)} per employee</span>
            </div>
            ${peerChart(share, budgetShare, C, stats)}
          </div>
        </section>
        <div class="b2-verdict b2-verdict-${v.level}">${v.text}</div>

        <div class="b3-depts">
          <span class="b3-depts-lbl">By department</span>
          ${rows.map(r => {
            const lv = r.used > 100 ? 'red' : r.used >= 95 ? 'yellow' : 'green';
            return `
              <div class="b3-dept ${sel === r.id ? 'is-sel' : ''}" title="${r.name}: ${eur(r.spent)} of ${eur(r.budget)} · €${r.vpe.toFixed(2)} value per € · ${eur(r.perEmp)} per employee">
                <div class="b3-dept-top"><strong>${r.name}</strong><span class="text-${lv}">${r.used}%</span></div>
                <div class="b2-dept-bar"><div class="bg-${lv}" style="width:${Math.min(100, r.used)}%"></div></div>
                <div class="b3-dept-amt">${k1(r.spent)} / ${k1(r.budget)}</div>
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
