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
  const eur = (n) => '€' + Math.round(n).toLocaleString('de-DE');
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
  // 1. OVERVIEW — 3 rows (Readiness · Adoption · Projects) × 3 KPIs (left 3/4)
  //               + 1 recommended CEO action per row (right 1/4)
  // ==========================================================================
  const annualValue = (outcome) => {
    const m = String(outcome || '').match(/€\s?([\d.,]+)\s*(k)?/i);
    if (!m) return 0;
    const n = Number(m[1].replace(/[.,]/g, ''));
    return m[2] ? n * 1000 : n;
  };
  const eurK = (n) => n >= 1000 ? `€${Math.round(n / 1000)}k` : eur(n);

  function kpiCard({ title, value, unit, sub, level, pct, targetPct, nav, info }) {
    return `
      <div class="ov-kpi" role="link" tabindex="0" data-nav-tab="${nav}">
        <div class="ov-kpi-top">
          <span class="ov-kpi-title">${title}${info ? ` ${infoBtn(info)}` : ''}</span>
          ${dot(level)}
        </div>
        <div class="ov-kpi-value">${value}${unit ? `<small>${unit}</small>` : ''}</div>
        ${pct !== undefined ? renderProgressLine({ pct, targetPct: targetPct ?? 100, level }) : '<div class="ov-kpi-spacer"></div>'}
        <div class="ov-kpi-sub">${sub}</div>
      </div>
    `;
  }

  function actionCard({ level, title, detail, primary, secondary }) {
    return `
      <div class="ov-action ov-action-${level}">
        <span class="ov-action-lbl">${t('ov_recommended')}</span>
        <strong class="ov-action-title">${title}</strong>
        <p class="ov-action-detail">${detail}</p>
        <div class="ov-action-btns">
          ${primary || ''}
          ${secondary || ''}
        </div>
      </div>
    `;
  }

  function overviewRow({ title, kpis, action }) {
    return `
      <section class="ov-row">
        <div class="ov-row-main">
          <h2 class="ov-row-title">${title}</h2>
          <div class="ov-kpi-grid">${kpis.join('')}</div>
        </div>
        <div class="ov-row-side">${action}</div>
      </section>
    `;
  }

  function renderOverview(metrics) {
    const role = S.getRole();
    const isCEO = role.isCEO;
    const showFin = S.canViewFinancials();
    const R = window.NUTEX_ROADMAP;
    const goBtn = (tab, label) => `<button type="button" class="link-btn" data-nav-tab="${tab}">${label || t('details')}</button>`;

    // ---------------- Row 1: AI READINESS (Data & Technology fixes) ----------------
    const dsPct = Math.round((metrics.dataSourcesReady / Math.max(1, metrics.dataSourcesTotal)) * 100);
    const dsTargetPct = Math.round((D.TARGETS.dataSourcesReady / 9) * 100);
    const dsSt = S.getStatus(dsPct, dsTargetPct);

    const rmItems = R ? Object.values(R.ITEM_INDEX) : [];
    const rmActive = rmItems.filter(m => m.status !== 'proposed');
    const rmDone = rmActive.filter(m => m.status === 'done').length;
    const rmOverdue = rmActive.filter(m => m.visualState === 'overdue');
    const rmPct = Math.round((rmDone / Math.max(1, rmActive.length)) * 100);
    const rmLevel = rmOverdue.length > 0 ? 'yellow' : 'green';

    const blockers = rmActive.filter(m => m.onPath && m.status !== 'done');
    const blockedProjects = metrics.blockedProjects;
    const blockerLevel = blockers.some(m => m.visualState === 'overdue') ? 'red' : blockers.length ? 'yellow' : 'green';
    const unlockText = blockers.find(m => m.unlocks)?.unlocks || '';

    const readinessKpis = [
      kpiCard({
        title: t('ov_data_sources'), info: 'dataReady', nav: 'readiness',
        value: `${metrics.dataSourcesReady}`, unit: ` / ${metrics.dataSourcesTotal}`,
        pct: dsPct, targetPct: dsTargetPct, level: dsSt.level,
        sub: `${t('target')} ${D.TARGETS.dataSourcesReady} / 9`
      }),
      kpiCard({
        title: t('ov_milestones'), nav: 'readiness',
        value: `${rmDone}`, unit: ` / ${rmActive.length}`,
        pct: rmPct, targetPct: 100, level: rmLevel,
        sub: rmOverdue.length ? `<span class="text-red">${rmOverdue.length} ${t('ov_overdue')}</span>` : t('ov_none_overdue')
      }),
      kpiCard({
        title: t('ov_blockers'), nav: 'readiness',
        value: `${blockers.length + blockedProjects.length}`,
        level: blockerLevel,
        sub: `${blockers.length} ${t('ov_on_critical_path')} · ${blockedProjects.length} ${t(blockedProjects.length === 1 ? 'ov_blocked_project' : 'ov_blocked_projects')}`
      })
    ];

    const focus = blockers.slice().sort((a, b) => {
      const ov = (b.visualState === 'overdue') - (a.visualState === 'overdue');
      return ov !== 0 ? ov : String(a.date || '9999').localeCompare(String(b.date || '9999'));
    })[0];

    const readinessAction = focus
      ? actionCard({
          level: focus.visualState === 'overdue' ? 'red' : 'yellow',
          title: t('ov_act_escalate', { x: focus.title }),
          detail: `${focus.statusMeta.text}${focus.owner ? ` · ${t('ov_owner')}: ${focus.owner}` : ` · ${t('ov_no_owner')}`}${unlockText ? `<br>${t('ov_unlocks')}: <strong>${focus.unlocks || unlockText}</strong>` : ''}`,
          primary: goBtn('readiness', t('ov_open_roadmap'))
        })
      : actionCard({
          level: 'green',
          title: t('ov_act_ready'),
          detail: t('ov_act_ready_detail'),
          primary: goBtn('readiness', t('ov_open_roadmap'))
        });

    // ---------------- Row 2: AI ADOPTION (people & implementation) ----------------
    const wSt = S.getStatus(metrics.weeklyPct, D.TARGETS.weeklyPct);
    const diffMonth = metrics.weeklyPct - metrics.weeklyPrevPct;
    const trnSt = S.getStatus(metrics.trainedPct, D.TARGETS.trainingPct);
    const culture = S.computeCulture();
    const cSt = S.getStatus(culture.overallPct, 75);

    const adoptionKpis = [
      kpiCard({
        title: t('metric_weekly'), info: 'adoption', nav: 'departments',
        value: `${metrics.weeklyPct}`, unit: '%',
        pct: metrics.weeklyPct, targetPct: D.TARGETS.weeklyPct, level: wSt.level,
        sub: `${t('target')} ${D.TARGETS.weeklyPct}% · <span class="${diffMonth >= 0 ? 'text-green' : 'text-red'}">${diffMonth >= 0 ? '+' : ''}${diffMonth}% ${t('ov_vs_prev')}</span>`
      }),
      kpiCard({
        title: t('employees_trained'), info: 'training', nav: 'trainings',
        value: `${metrics.trainedPct}`, unit: '%',
        pct: metrics.trainedPct, targetPct: D.TARGETS.trainingPct, level: trnSt.level,
        sub: `${t('target')} ${D.TARGETS.trainingPct}% · ${metrics.untrainedCount} ${t('untrained_suffix')}`
      }),
      kpiCard({
        title: t('ov_culture'), nav: 'culture',
        value: `${culture.overallPct}`, unit: '%',
        pct: culture.overallPct, targetPct: 75, level: cSt.level,
        sub: `${t('target')} 75% · ${culture.responsePct}% ${t('responses')}`
      })
    ];

    const lagRow = metrics.rows.slice().sort((a, b) => (a.weeklyPct - D.TARGETS.weeklyPct) - (b.weeklyPct - D.TARGETS.weeklyPct))[0];
    const lagTraining = lagRow ? metrics.pendingTrainings.find(tr => tr.deptId === lagRow.dept.id) : null;
    const anyTraining = lagTraining || metrics.pendingTrainings.slice().sort((a, b) => b.participants - a.participants)[0];

    let adoptionAction;
    if (lagRow && lagRow.weeklyPct >= D.TARGETS.weeklyPct && !anyTraining) {
      adoptionAction = actionCard({
        level: 'green', title: t('ov_act_adoption_ok'), detail: t('ov_act_adoption_ok_detail'),
        primary: goBtn('departments')
      });
    } else if (anyTraining) {
      const trDept = metrics.rows.find(r => r.dept.id === anyTraining.deptId);
      adoptionAction = actionCard({
        level: wSt.level === 'green' ? 'yellow' : wSt.level,
        title: isCEO ? t('ov_act_approve_training', { x: anyTraining.name }) : t('ov_act_push_training', { x: anyTraining.name }),
        detail: `${trDept ? `${trDept.dept.name}: ${trDept.weeklyPct}% ${t('ov_weekly_vs', { v: D.TARGETS.weeklyPct })}<br>` : ''}${anyTraining.participants} ${t('employees')}${showFin && anyTraining.budget ? ` · ${eur(anyTraining.budget)}` : ''} · ${anyTraining.timeline}`,
        primary: isCEO ? `<button type="button" class="btn-approve" data-train-approve="${anyTraining.id}">${t('approve')}</button>` : '',
        secondary: goBtn('trainings')
      });
    } else {
      adoptionAction = actionCard({
        level: wSt.level,
        title: t('ov_act_lagging', { x: lagRow.dept.name }),
        detail: `${lagRow.weeklyPct}% ${t('ov_weekly_vs', { v: D.TARGETS.weeklyPct })} · ${t('ov_owner')}: ${lagRow.dept.vp}`,
        primary: goBtn('departments')
      });
    }

    // ---------------- Row 3: AI PROJECTS (budget & successful projects) ----------------
    const bLevel = metrics.budgetUsedPct > 95 ? 'red' : metrics.budgetUsedPct > 80 ? 'yellow' : 'green';
    const live = metrics.approvedProjects;
    const liveValue = live.reduce((s, p) => s + annualValue(p.outcome), 0);
    const savTarget = Math.round(D.TARGETS.costSavedMo * (metrics.totalEmp / 300));
    const savPct = Math.round((metrics.costSavedMo / Math.max(1, savTarget)) * 100);
    const savSt = S.getStatus(metrics.costSavedMo, savTarget);
    const hrsTarget = Math.round(D.TARGETS.hoursSavedMo * (metrics.totalEmp / 300));
    const hrsSt = S.getStatus(metrics.hoursSavedMo, hrsTarget);
    const pending = metrics.pendingProjects;

    const projectKpis = [
      showFin
        ? kpiCard({
            title: t('monthly_budget'), nav: 'budget',
            value: eurK(metrics.totalSpendMo), unit: ` / ${eurK(metrics.budgetLimit)}`,
            pct: metrics.budgetUsedPct, targetPct: 100, level: bLevel,
            sub: metrics.budgetRemaining >= 0
              ? `${metrics.budgetUsedPct}% ${t('used')} · <span class="text-green">${eurK(metrics.budgetRemaining)} ${t('left')}</span>`
              : `<span class="text-red">${eurK(Math.abs(metrics.budgetRemaining))} ${t('over')}</span>`
          })
        : kpiCard({
            title: t('ov_pipeline'), nav: 'projects',
            value: `${pending.length}`, level: pending.length ? 'yellow' : 'green',
            sub: `${t('Pending')} · ${blockedProjects.length} ${t('Blocked')}`
          }),
      kpiCard({
        title: t('ov_live_projects'), nav: 'projects',
        value: `${live.length}`,
        level: live.length ? 'green' : 'yellow',
        sub: liveValue ? `${eurK(liveValue)} ${t('ov_value_per_year')}` : t('ov_no_live')
      }),
      showFin
        ? kpiCard({
            title: t('ov_savings'), info: 'impact', nav: 'budget',
            value: eurK(metrics.costSavedMo), unit: t('ov_per_mo'),
            pct: savPct, targetPct: 100, level: savSt.level,
            sub: `${t('target')} ${eurK(savTarget)} · ${metrics.hoursSavedMo.toLocaleString('de-DE')} h`
          })
        : kpiCard({
            title: t('ov_hours_saved'), info: 'impact', nav: 'departments',
            value: metrics.hoursSavedMo.toLocaleString('de-DE'), unit: ' h',
            pct: Math.round((metrics.hoursSavedMo / Math.max(1, hrsTarget)) * 100), targetPct: 100, level: hrsSt.level,
            sub: `${t('target')} ${hrsTarget.toLocaleString('de-DE')} h ${t('ov_per_mo')}`
          })
    ];

    const best = pending.slice().sort((a, b) =>
      (annualValue(b.outcome) / Math.max(1, b.budget)) - (annualValue(a.outcome) / Math.max(1, a.budget))
    )[0];
    const reallocCount = Math.min(metrics.unusedLicenses, metrics.openRequests);

    let projectAction;
    if (best) {
      const monthlyCost = Math.round((best.budget || 0) / 12);
      const fits = metrics.budgetRemaining >= monthlyCost;
      projectAction = actionCard({
        level: 'yellow',
        title: isCEO ? t('ov_act_approve_project', { x: best.name }) : t('ov_act_push_project', { x: best.name }),
        detail: `${best.outcome}${showFin && best.budget ? `<br>${t('ov_invest')}: <strong>${eur(best.budget)}</strong> · ${fits ? `<span class="text-green">${t('ov_fits_budget')}</span>` : `<span class="text-red">${t('ov_needs_budget', { v: eur(monthlyCost - metrics.budgetRemaining) })}</span>`}` : ''}`,
        primary: isCEO ? `<button type="button" class="btn-approve" data-project-approve="${best.id}">${t('approve')}</button>` : '',
        secondary: goBtn('projects', pending.length > 1 ? t('ov_all_pending', { n: pending.length }) : t('details'))
      });
    } else if (reallocCount > 0) {
      projectAction = actionCard({
        level: 'yellow',
        title: t('reallocate_seats', { n: reallocCount }),
        detail: `${metrics.unusedLicenses} ${t('unused')}${showFin && metrics.unusedCostMo ? ` · ${eur(metrics.unusedCostMo)}${t('ov_per_mo')}` : ''}`,
        primary: goBtn('licenses')
      });
    } else {
      projectAction = actionCard({
        level: 'green', title: t('ov_act_projects_ok'), detail: t('all_decided'),
        primary: isCEO ? goBtn('projects') : `<button type="button" class="btn-primary-sm" data-action="open-project-modal">${t('new_project')}</button>`
      });
    }

    return `
      <div class="overview-screen ov-screen">
        <div class="ov-head">
          <div class="ov-head-main">
            <span class="ov-head-scope">${isCEO ? t('ov_company_status') : `${role.title} · ${role.name}`} · ${metrics.tf.label}</span>
          </div>
          <div class="ov-head-side"><span class="ov-head-scope">${isCEO ? t('ov_ceo_actions') : t('ov_actions')}</span></div>
        </div>
        ${overviewRow({ title: t('ov_readiness'), kpis: readinessKpis, action: readinessAction })}
        ${overviewRow({ title: t('ai_adoption'), kpis: adoptionKpis, action: adoptionAction })}
        ${overviewRow({ title: t('ai_projects'), kpis: projectKpis, action: projectAction })}
      </div>
    `;
  }

  // ==========================================================================
  // 1b. READINESS — Drill-down: Technical Roadmap + Data Sources by Department
  // ==========================================================================
  function renderReadiness(metrics) {
    return `
      <div class="page-stack">
        ${window.NUTEX_ROADMAP ? window.NUTEX_ROADMAP.render() : ''}
        <div class="card card-lg">
          <div class="panel-head">
            <h3>${t('ov_data_sources')} ${infoBtn('dataReady')}</h3>
            <span class="muted-sm">${metrics.dataSourcesReady} / ${metrics.dataSourcesTotal} · ${t('target')} ${D.TARGETS.dataSourcesReady} / 9</span>
          </div>
          <table class="clean-table">
            <thead><tr><th>${t('dept_col')}</th><th>${t('ov_ready_col')}</th><th>${t('ov_status_col')}</th></tr></thead>
            <tbody>
              ${metrics.rows.slice().sort((a, b) => (a.dataSourcesReady / a.dataSourcesTotal) - (b.dataSourcesReady / b.dataSourcesTotal)).map(r => {
                const lvl = r.dataSourcesReady >= r.dataSourcesTotal ? 'green' : r.dataSourcesReady > 0 ? 'yellow' : 'red';
                return `
                  <tr>
                    <td><strong>${r.dept.name}</strong></td>
                    <td>${r.dataSourcesReady} / ${r.dataSourcesTotal}</td>
                    <td><span class="pill pill-${lvl}">${dot(lvl)} ${lvl === 'green' ? t('on_track') : lvl === 'yellow' ? t('watch') : t('action_needed')}</span></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
        <div class="card card-lg">
          <div class="panel-head"><h3>${t('ov_systems')}</h3></div>
          <table class="clean-table">
            <tbody>
              ${D.SYSTEMS.map(s => {
                const lvl = s.status === 'Live' ? 'green' : s.status === 'Blocked' ? 'red' : 'yellow';
                return `
                  <tr>
                    <td><strong>${s.name}</strong></td>
                    <td class="muted-sm">${s.detail}</td>
                    <td><span class="pill pill-${lvl}">${dot(lvl)} ${s.status}</span></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
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
