/* ============================================================================
   NuTex Inc. — Actionable Executive Dataset (300 Employees, Jan–Nov 2026)
   No abstract readiness scores, no jargon abbreviations.
   ============================================================================ */

window.NUTEX_DATA = (() => {
  const THRESHOLDS = { green: 95, yellow: 80 };

  const TARGETS = {
    weeklyPct: 75,          // Employees using AI weekly
    dailyPct: 45,           // Employees using AI 3+ days/week
    licenseActivePct: 85,   // Active share of paid licenses
    costPerActive: 42,      // €/month max target
    trainingPct: 80,        // Employees trained
    dataSourcesReady: 7,    // out of 9 needed data sources
    hoursSavedMo: 1500,
    costSavedMo: 58000,
    errorRateMax: 3.2       // % (before AI: 4.2%)
  };

  const KPI_INFO = {
    adoption:   { source: 'Tool Logs', updated: '2026-11-19', freq: 'Daily', text: 'Employees using at least one AI tool every week.' },
    licenses:   { source: 'Tool & Finance Logs', updated: '2026-11-19', freq: 'Daily', text: 'Paid licenses compared to active monthly users and cost per active user.' },
    training:   { source: 'Learning Platform', updated: '2026-11-18', freq: 'Weekly', text: 'Share of employees who completed core AI training.' },
    dataReady:  { source: 'IT Audit', updated: '2026-11-18', freq: 'Weekly', text: 'Data sources meeting all quality & security criteria.' },
    impact:     { source: 'Logs & Finance', updated: '2026-11-18', freq: 'Monthly', text: 'Estimated monthly hours & savings paired with measured process error rate.' }
  };

  const ROLES = [
    { id: 'ceo',           name: 'Chris Turner',    title: 'CEO',           isCEO: true,  ownDepts: ['rd', 'marketing', 'sales', 'production', 'logistics', 'purchasing'] },
    { id: 'vp_rd',         name: 'Sarah Klein',     title: 'VP R&D',        isCEO: false, ownDepts: ['rd'] },
    { id: 'vp_commercial', name: 'Marcus Weber',    title: 'VP Commercial', isCEO: false, ownDepts: ['marketing', 'sales'] },
    { id: 'vp_production', name: 'Dr. Thomas Berg', title: 'VP Production', isCEO: false, ownDepts: ['production'] },
    { id: 'vp_logistics',  name: 'Julia Hoffmann',  title: 'VP Logistics',  isCEO: false, ownDepts: ['logistics'] },
    { id: 'vp_purchasing', name: 'Andreas Richter', title: 'VP Purchasing', isCEO: false, ownDepts: ['purchasing'] }
  ];

  const DEFAULT_RBAC = {
    ceo:           { allDepts: true, financials: true },
    vp_rd:         { allDepts: true, financials: false },
    vp_commercial: { allDepts: true, financials: false },
    vp_production: { allDepts: true, financials: false },
    vp_logistics:  { allDepts: true, financials: false },
    vp_purchasing: { allDepts: true, financials: false }
  };

  const TOOLS = [
    { id: 'm365',       name: 'M365 Copilot',       costPerSeat: 28 },
    { id: 'textilegpt', name: 'NuTex TextileGPT',   costPerSeat: 18 },
    { id: 'chatgpt',    name: 'ChatGPT Enterprise', costPerSeat: 55 },
    { id: 'supplyai',   name: 'CAD-AI & SupplyAI',  costPerSeat: 56 }
  ];

  // Monthly Timeframes: Nov 2026 back to Jan 2026 (no Q3)
  const TIMEFRAMES = {
    nov_2026: { label: 'Nov 2026', factor: 1.00, prevFactor: 0.93 },
    oct_2026: { label: 'Oct 2026', factor: 0.93, prevFactor: 0.87 },
    sep_2026: { label: 'Sep 2026', factor: 0.87, prevFactor: 0.79 },
    aug_2026: { label: 'Aug 2026', factor: 0.79, prevFactor: 0.72 },
    jul_2026: { label: 'Jul 2026', factor: 0.72, prevFactor: 0.64 },
    jun_2026: { label: 'Jun 2026', factor: 0.64, prevFactor: 0.55 },
    may_2026: { label: 'May 2026', factor: 0.55, prevFactor: 0.47 },
    apr_2026: { label: 'Apr 2026', factor: 0.47, prevFactor: 0.39 },
    mar_2026: { label: 'Mar 2026', factor: 0.39, prevFactor: 0.31 },
    feb_2026: { label: 'Feb 2026', factor: 0.31, prevFactor: 0.24 },
    jan_2026: { label: 'Jan 2026', factor: 0.24, prevFactor: 0.20 }
  };

  // 6 Departments = 300 Employees exact
  const DEPARTMENTS = [
    {
      id: 'rd', name: 'R&D', vp: 'Sarah Klein', employees: 45, targetUsers: 44,
      dataSourcesReady: 1, dataSourcesTotal: 1,
      trainedEmployees: 40, weeklyUsers: 38, dailyUsers: 26, openRequests: 9,
      hoursSavedMo: 340, costSavedMo: 14200, errorRatePct: 2.4, cycleDays: 3.0,
      tokensM: 16.4, tokenRate: 55,
      seats: {
        m365:       { purchased: 35, assigned: 34, active: 31 },
        textilegpt: { purchased: 45, assigned: 43, active: 38 },
        chatgpt:    { purchased: 25, assigned: 24, active: 22 },
        supplyai:   { purchased: 30, assigned: 28, active: 25 }
      },
      teams: [
        { name: 'Smart Textiles Lab',  employees: 16, weeklyPct: 88, dailyPct: 63, trainedPct: 94 },
        { name: 'Material Simulation', employees: 15, weeklyPct: 87, dailyPct: 60, trainedPct: 87 },
        { name: 'Sustainability Lab',  employees: 8,  weeklyPct: 75, dailyPct: 50, trainedPct: 88 },
        { name: 'IP & Patents',        employees: 6,  weeklyPct: 83, dailyPct: 50, trainedPct: 83 }
      ]
    },
    {
      id: 'marketing', name: 'Marketing', vp: 'Marcus Weber', employees: 30, targetUsers: 30,
      dataSourcesReady: 1, dataSourcesTotal: 1,
      trainedEmployees: 25, weeklyUsers: 24, dailyUsers: 15, openRequests: 5,
      hoursSavedMo: 225, costSavedMo: 8900, errorRatePct: 2.9, cycleDays: 2.8,
      tokensM: 6.8, tokenRate: 45,
      seats: {
        m365:       { purchased: 28, assigned: 27, active: 23 },
        textilegpt: { purchased: 20, assigned: 18, active: 15 },
        chatgpt:    { purchased: 28, assigned: 27, active: 24 },
        supplyai:   { purchased: 0,  assigned: 0,  active: 0 }
      },
      teams: [
        { name: 'Brand & Content',     employees: 16, weeklyPct: 88, dailyPct: 56, trainedPct: 88 },
        { name: 'Market Intelligence', employees: 7,  weeklyPct: 71, dailyPct: 43, trainedPct: 86 },
        { name: 'Trade Shows & PR',    employees: 7,  weeklyPct: 71, dailyPct: 43, trainedPct: 71 }
      ]
    },
    {
      id: 'sales', name: 'Sales', vp: 'Marcus Weber', employees: 50, targetUsers: 48,
      dataSourcesReady: 1, dataSourcesTotal: 2,
      trainedEmployees: 38, weeklyUsers: 37, dailyUsers: 22, openRequests: 10,
      hoursSavedMo: 310, costSavedMo: 11800, errorRatePct: 2.8, cycleDays: 3.1,
      tokensM: 8.5, tokenRate: 46,
      seats: {
        m365:       { purchased: 48, assigned: 45, active: 37 },
        textilegpt: { purchased: 42, assigned: 38, active: 31 },
        chatgpt:    { purchased: 22, assigned: 20, active: 17 },
        supplyai:   { purchased: 0,  assigned: 0,  active: 0 }
      },
      teams: [
        { name: 'Auto & Marine Accounts', employees: 20, weeklyPct: 80, dailyPct: 50, trainedPct: 85 },
        { name: 'Apparel & Retail',       employees: 18, weeklyPct: 67, dailyPct: 39, trainedPct: 67 },
        { name: 'Sales Operations',       employees: 6,  weeklyPct: 83, dailyPct: 50, trainedPct: 83 },
        { name: 'Bid Desk',               employees: 6,  weeklyPct: 67, dailyPct: 33, trainedPct: 67 }
      ]
    },
    {
      id: 'production', name: 'Production', vp: 'Dr. Thomas Berg', employees: 90, targetUsers: 60,
      dataSourcesReady: 0, dataSourcesTotal: 2,
      trainedEmployees: 49, weeklyUsers: 42, dailyUsers: 19, openRequests: 6,
      hoursSavedMo: 245, costSavedMo: 9400, errorRatePct: 3.5, cycleDays: 4.1,
      tokensM: 9.2, tokenRate: 52,
      seats: {
        m365:       { purchased: 42, assigned: 34, active: 24 },
        textilegpt: { purchased: 45, assigned: 36, active: 26 },
        chatgpt:    { purchased: 10, assigned: 8,  active: 5 },
        supplyai:   { purchased: 24, assigned: 18, active: 13 }
      },
      teams: [
        { name: 'Weaving Plant A',       employees: 34, weeklyPct: 50, dailyPct: 24, trainedPct: 59 },
        { name: 'Finishing Plant B',     employees: 28, weeklyPct: 36, dailyPct: 14, trainedPct: 43 },
        { name: 'Quality Assurance Lab', employees: 16, weeklyPct: 63, dailyPct: 31, trainedPct: 69 },
        { name: 'Maintenance Planning',  employees: 7,  weeklyPct: 43, dailyPct: 14, trainedPct: 57 },
        { name: 'Shift Scheduling',      employees: 5,  weeklyPct: 40, dailyPct: 20, trainedPct: 40 }
      ]
    },
    {
      id: 'logistics', name: 'Logistics', vp: 'Julia Hoffmann', employees: 45, targetUsers: 36,
      dataSourcesReady: 0, dataSourcesTotal: 2,
      trainedEmployees: 29, weeklyUsers: 26, dailyUsers: 14, openRequests: 5,
      hoursSavedMo: 155, costSavedMo: 5800, errorRatePct: 3.2, cycleDays: 3.7,
      tokensM: 4.1, tokenRate: 48,
      seats: {
        m365:       { purchased: 25, assigned: 22, active: 17 },
        textilegpt: { purchased: 18, assigned: 15, active: 11 },
        chatgpt:    { purchased: 8,  assigned: 7,  active: 5 },
        supplyai:   { purchased: 26, assigned: 20, active: 14 }
      },
      teams: [
        { name: 'Warehouse & Fulfillment', employees: 20, weeklyPct: 50, dailyPct: 25, trainedPct: 55 },
        { name: 'Transport & Fleet',       employees: 14, weeklyPct: 64, dailyPct: 36, trainedPct: 71 },
        { name: 'Customs Compliance',      employees: 6,  weeklyPct: 67, dailyPct: 33, trainedPct: 83 },
        { name: 'Inventory Control',       employees: 5,  weeklyPct: 60, dailyPct: 40, trainedPct: 60 }
      ]
    },
    {
      id: 'purchasing', name: 'Purchasing', vp: 'Andreas Richter', employees: 40, targetUsers: 37,
      dataSourcesReady: 1, dataSourcesTotal: 1,
      trainedEmployees: 29, weeklyUsers: 26, dailyUsers: 15, openRequests: 3,
      hoursSavedMo: 145, costSavedMo: 7100, errorRatePct: 2.9, cycleDays: 3.4,
      tokensM: 3.6, tokenRate: 46,
      seats: {
        m365:       { purchased: 32, assigned: 29, active: 24 },
        textilegpt: { purchased: 16, assigned: 14, active: 11 },
        chatgpt:    { purchased: 12, assigned: 11, active: 9 },
        supplyai:   { purchased: 24, assigned: 21, active: 17 }
      },
      teams: [
        { name: 'Fiber & Yarn Sourcing', employees: 16, weeklyPct: 69, dailyPct: 44, trainedPct: 75 },
        { name: 'Supplier Contracts',    employees: 13, weeklyPct: 69, dailyPct: 39, trainedPct: 77 },
        { name: 'Indirect Procurement',  employees: 6,  weeklyPct: 50, dailyPct: 33, trainedPct: 67 },
        { name: 'Cost Engineering',      employees: 5,  weeklyPct: 60, dailyPct: 20, trainedPct: 60 }
      ]
    }
  ];

  // VP-Submitted Projects for CEO Approval (Live editable + persisted in localStorage)
  const INITIAL_PROJECTS = [
    {
      id: 'p1',
      name: 'Optical Fabric Defect Camera',
      deptId: 'production',
      owner: 'Dr. Thomas Berg',
      outcome: 'Cut weaving scrap by 35% (€185,000/yr)',
      budget: 48000,
      timeline: 'Q1 2027',
      status: 'Pending'
    },
    {
      id: 'p2',
      name: 'Raw Yarn Price Forecast',
      deptId: 'purchasing',
      owner: 'Andreas Richter',
      outcome: 'Save €120,000/yr on fiber contracts',
      budget: 24000,
      timeline: 'Q1 2027',
      status: 'Pending'
    },
    {
      id: 'p3',
      name: 'Automated Quote & Spec Drafting',
      deptId: 'sales',
      owner: 'Marcus Weber',
      outcome: 'Quotes 38% faster (€142,000/yr)',
      budget: 18000,
      timeline: 'Live',
      status: 'Approved'
    },
    {
      id: 'p4',
      name: 'Yarn Formulation Assistant',
      deptId: 'rd',
      owner: 'Sarah Klein',
      outcome: '30% faster lab tests (€165,000/yr)',
      budget: 32000,
      timeline: 'Live',
      status: 'Approved'
    },
    {
      id: 'p5',
      name: 'Predictive Loom Maintenance',
      deptId: 'production',
      owner: 'Dr. Thomas Berg',
      outcome: 'Blocked: Plant B machine data missing',
      budget: 65000,
      timeline: 'Q2 2027',
      status: 'Blocked'
    }
  ];

  // VP-Submitted Training Budget Requests for CEO Approval
  const INITIAL_TRAININGS = [
    {
      id: 't1',
      name: 'Shopfloor AI Basics Workshop',
      deptId: 'production',
      owner: 'Dr. Thomas Berg',
      outcome: 'Train 41 operators · Reach 80% trained',
      participants: 41,
      budget: 12000,
      timeline: 'Dec 2026',
      status: 'Pending'
    },
    {
      id: 't2',
      name: 'SupplyAI Warehouse Training',
      deptId: 'logistics',
      owner: 'Julia Hoffmann',
      outcome: '16 warehouse leads · Fewer order errors',
      participants: 16,
      budget: 6500,
      timeline: 'Jan 2027',
      status: 'Pending'
    },
    {
      id: 't3',
      name: 'Sales Prompting Bootcamp',
      deptId: 'sales',
      owner: 'Marcus Weber',
      outcome: '12 field reps · Faster customer quotes',
      participants: 12,
      budget: 4800,
      timeline: 'Completed',
      status: 'Approved'
    },
    {
      id: 't4',
      name: 'Advanced Fiber Simulation AI',
      deptId: 'rd',
      owner: 'Sarah Klein',
      outcome: '15 chemists · Deeper CAD-AI usage',
      participants: 15,
      budget: 8200,
      timeline: 'Running',
      status: 'Approved'
    }
  ];

  // Enterprise Systems & Data Readiness (Concrete Status)
  const SYSTEMS = [
    { name: 'Azure OpenAI EU Gateway', status: 'Live',       detail: 'All departments connected' },
    { name: 'NuTex Textile Spec Library', status: 'Live',    detail: '18,400 specs searchable' },
    { name: 'Salesforce CRM Copilot',  status: 'In Rollout', detail: '38 of 50 sales reps live' },
    { name: 'SAP Supply Chain Data',   status: 'In Rollout', detail: 'Carrier feeds finishing Dec' },
    { name: 'Plant B Loom Machines',   status: 'Blocked',    detail: 'No digital export yet' }
  ];

  // Monthly Employee AI Culture Survey (5 Questions + Tool Wish Ranking per Dept)
  const CULTURE_SURVEY = {
    questions: [
      { id: 'q_tools',   en: 'Have the AI tools I need',         de: 'Habe die KI-Tools, die ich brauche' },
      { id: 'q_freedom', en: 'Freedom to use & explore AI',      de: 'Kann KI frei ausleben & nutzen' },
      { id: 'q_manager', en: 'Manager encourages AI use',        de: 'Führungskraft fördert KI-Nutzung' },
      { id: 'q_rules',   en: 'Clear rules & data safety',        de: 'Klare Regeln & Datensicherheit' },
      { id: 'q_trust',   en: 'Positive outlook (no fear of AI)', de: 'Positives Gefühl (keine Angst vor KI)' }
    ],
    byDept: {
      rd:         { responseRate: 0.91, scores: { q_tools: 84, q_freedom: 91, q_manager: 89, q_rules: 86, q_trust: 87 }, wishes: { perplexity: 14, claude: 16, midjourney: 5,  deepl: 4,  cursor: 15 } },
      marketing:  { responseRate: 0.90, scores: { q_tools: 78, q_freedom: 86, q_manager: 85, q_rules: 81, q_trust: 80 }, wishes: { perplexity: 11, claude: 9,  midjourney: 19, deepl: 8,  cursor: 1  } },
      sales:      { responseRate: 0.84, scores: { q_tools: 74, q_freedom: 79, q_manager: 82, q_rules: 80, q_trust: 76 }, wishes: { perplexity: 18, claude: 11, midjourney: 8,  deepl: 12, cursor: 1  } },
      production: { responseRate: 0.76, scores: { q_tools: 51, q_freedom: 57, q_manager: 66, q_rules: 74, q_trust: 56 }, wishes: { perplexity: 8,  claude: 7,  midjourney: 6,  deepl: 3,  cursor: 5  } },
      logistics:  { responseRate: 0.80, scores: { q_tools: 62, q_freedom: 67, q_manager: 74, q_rules: 78, q_trust: 66 }, wishes: { perplexity: 7,  claude: 5,  midjourney: 2,  deepl: 3,  cursor: 1  } },
      purchasing: { responseRate: 0.85, scores: { q_tools: 70, q_freedom: 74, q_manager: 79, q_rules: 83, q_trust: 73 }, wishes: { perplexity: 10, claude: 8,  midjourney: 1,  deepl: 6,  cursor: 1  } }
    },
    wishTools: [
      { id: 'perplexity', name: 'Perplexity Enterprise' },
      { id: 'claude',     name: 'Claude for Work' },
      { id: 'midjourney', name: 'Midjourney / Firefly' },
      { id: 'deepl',      name: 'DeepL Write Pro' },
      { id: 'cursor',     name: 'Cursor / GitHub Copilot' }
    ]
  };

  // 2026 Monthly Progress Targets (Jan–Nov)
  const TREND_2026 = {
    keys: ['jan_2026', 'feb_2026', 'mar_2026', 'apr_2026', 'may_2026', 'jun_2026', 'jul_2026', 'aug_2026', 'sep_2026', 'oct_2026', 'nov_2026'],
    labelsEn: ['Jan 26', 'Feb 26', 'Mar 26', 'Apr 26', 'May 26', 'Jun 26', 'Jul 26', 'Aug 26', 'Sep 26', 'Oct 26', 'Nov 26'],
    labelsDe: ['Jan 26', 'Feb 26', 'Mär 26', 'Apr 26', 'Mai 26', 'Jun 26', 'Jul 26', 'Aug 26', 'Sep 26', 'Okt 26', 'Nov 26'],
    weekly:  { target: 75 },
    daily:   { target: 45 },
    trained: { target: 80 }
  };

  // Bilingual UI Dictionary (EN / DE) — ultra-concise
  const I18N = {
    en: {
      nav_overview: 'Overview',
      nav_projects: 'Projects',
      nav_trainings: 'Trainings',
      nav_licenses: 'Licenses',
      nav_budget: 'Budget',
      nav_departments: 'Departments',
      nav_culture: 'Culture',
      culture_pulse: 'Monthly Survey (5 Questions)',
      culture_wishes: 'Most Wanted Tools',
      culture_by_dept: 'Culture by Department',
      culture_trend: 'Culture Progress (Jan–Nov)',
      responses: 'responses',
      agree: 'agree',
      votes: 'votes',
      filters: 'Filters',
      reset: 'Reset',
      all_depts: 'All Departments (300)',
      accessible_depts: 'Accessible Depts',
      industry_tag: '◆ Industry Avg (Consulting)',
      industry_short: 'Industry Avg',
      target: 'Target',
      decisions: 'Decisions',
      todos: 'To-dos',
      ai_projects: 'AI Projects',
      projects: 'Projects',
      approval_needed: 'Approval needed',
      all_decided: 'All decided',
      trainings: 'Trainings',
      trained_suffix: 'trained',
      untrained_suffix: 'untrained',
      reallocate_seats: 'Reallocate {n} Seats',
      licenses: 'Licenses',
      unused: 'unused',
      paid: 'paid',
      monthly_budget: 'Monthly Budget',
      adjust: 'Adjust →',
      view: 'View →',
      used: 'used',
      spent: 'spent',
      left: 'left',
      over: 'over',
      project_approvals: 'Project Approvals',
      my_proposals: 'My Proposals',
      new_btn: '+ New',
      none_pending: '✓ None pending',
      approve: 'Approve',
      decline: 'Decline',
      undo: 'Undo',
      ai_adoption: 'AI Adoption',
      employees_using_ai: 'Employees using AI',
      funnel_all: 'All Employees',
      funnel_target: 'AI Target Group',
      funnel_trained: 'Trained',
      funnel_weekly: 'Weekly Users',
      usage_by_dept: 'AI Usage by Department',
      usage_by_tool: 'AI Usage by Tools',
      details: 'Details →',
      active_seats: 'Active seats',
      all: 'All',
      Pending: 'Pending',
      Approved: 'Approved',
      Blocked: 'Blocked',
      Declined: 'Declined',
      new_project: '+ New Project',
      request_training: '+ Request Training',
      outcome: 'Outcome',
      employees_trained: 'Employees Trained',
      needed_for_target: 'To Reach 80%',
      in_requests: 'In Requests',
      by_dept: 'By Department',
      emp: 'emp',
      active: 'Active',
      open_requests: 'open requests',
      per_active_user: '/ active user',
      actions: 'Actions',
      reallocate_btn: 'Reallocate',
      cancel_seats_btn: 'Cancel Seats',
      all_requests_filled: 'All Requests Filled',
      no_excess_seats: 'No Excess Seats',
      unused_to_req: 'Unused → Open requests',
      zero_requests: '0 open requests',
      cancel_n_seats: 'Cancel {n} Unused Seats',
      save_mo: 'Save {v} / mo',
      optimized: 'Optimized',
      done: 'Done',
      dept_col: 'Department',
      paid_col: 'Paid',
      active_col: 'Active',
      unused_col: 'Unused',
      increase_budget: 'Increase Budget',
      save: 'Save',
      ceo_only: 'CEO only',
      ceo_fin_only: 'CEO & Finance only',
      spend_breakdown: 'Spend Breakdown',
      ai_licenses: 'AI Licenses',
      api_tokens: 'API Tokens',
      token_usage_cost: 'Tokens & Cost',
      tokens_col: 'Tokens',
      cost_col: 'Cost',
      per_1m: '/ 1M tokens',
      tokens_short: 'tokens',
      approved_projects: 'Approved Projects',
      approved_trainings: 'Approved Trainings',
      weekly: 'Weekly',
      daily: 'Daily',
      trained: 'Trained',
      metric_weekly: 'Weekly AI Users',
      metric_daily: 'Daily AI Users',
      metric_trained: 'Employees Trained',
      summary: 'Summary',
      leading: 'Leading',
      lagging: 'Lagging',
      progress_2026: '2026 Progress (Jan–Nov)',
      click_dept_hint: 'Click a department bar to filter trend',
      all_depts_short: 'All Departments',
      on_track: 'On Track',
      watch: 'Watch',
      action_needed: 'Action Needed',
      settings: 'Settings',
      appearance: 'Appearance',
      light: 'Light',
      dark: 'Dark',
      language: 'Language',
      cancel: 'Cancel',
      submit: 'Submit',
      project_name: 'Project Name',
      expected_outcome: 'Expected Outcome',
      budget_eur: 'Budget (€)',
      timeline: 'Timeline',
      title: 'Title',
      employees: 'Employees',
      restricted: 'Restricted',
      nav_readiness: 'Readiness'
    },
    de: {
      nav_overview: 'Übersicht',
      nav_projects: 'Projekte',
      nav_trainings: 'Schulungen',
      nav_licenses: 'Lizenzen',
      nav_budget: 'Budget',
      nav_departments: 'Abteilungen',
      nav_culture: 'Kultur',
      culture_pulse: 'Monatsumfrage (5 Fragen)',
      culture_wishes: 'Tool-Wunschliste',
      culture_by_dept: 'Kultur nach Abteilung',
      culture_trend: 'Kultur-Verlauf (Jan–Nov)',
      responses: 'Antworten',
      agree: 'Zustimmung',
      votes: 'Stimmen',
      filters: 'Filter',
      reset: 'Zurücksetzen',
      all_depts: 'Alle Abteilungen (300)',
      accessible_depts: 'Freigegebene Abt.',
      industry_tag: '◆ Branchenschnitt (Beratung)',
      industry_short: 'Branchenschnitt',
      target: 'Ziel',
      decisions: 'Entscheidungen',
      todos: 'Aufgaben',
      ai_projects: 'KI-Projekte',
      projects: 'Projekte',
      approval_needed: 'Freigabe offen',
      all_decided: 'Alle entschieden',
      trainings: 'Schulungen',
      trained_suffix: 'geschult',
      untrained_suffix: 'ungeschult',
      reallocate_seats: '{n} Lizenzen umverteilen',
      licenses: 'Lizenzen',
      unused: 'ungenutzt',
      paid: 'bezahlt',
      monthly_budget: 'Monatsbudget',
      adjust: 'Anpassen →',
      view: 'Details →',
      used: 'verbraucht',
      spent: 'verbraucht',
      left: 'verfügbar',
      over: 'über Budget',
      project_approvals: 'Projekt-Freigaben',
      my_proposals: 'Meine Vorschläge',
      new_btn: '+ Neu',
      none_pending: '✓ Keine offenen Anträge',
      approve: 'Freigeben',
      decline: 'Ablehnen',
      undo: 'Rückgängig',
      ai_adoption: 'KI-Nutzung',
      employees_using_ai: 'Mitarbeitende mit KI-Nutzung',
      funnel_all: 'Alle Mitarbeitende',
      funnel_target: 'KI-Zielgruppe',
      funnel_trained: 'Geschult',
      funnel_weekly: 'Wöchentl. Nutzer',
      usage_by_dept: 'KI-Nutzung nach Abteilung',
      usage_by_tool: 'KI-Nutzung nach Tool',
      details: 'Details →',
      active_seats: 'Aktive Lizenzen',
      all: 'Alle',
      Pending: 'Offen',
      Approved: 'Freigegeben',
      Blocked: 'Blockiert',
      Declined: 'Abgelehnt',
      new_project: '+ Neues Projekt',
      request_training: '+ Schulung anfragen',
      outcome: 'Ergebnis',
      employees_trained: 'Geschulte Mitarbeitende',
      needed_for_target: 'Bis 80%-Ziel',
      in_requests: 'In Anträgen',
      by_dept: 'Nach Abteilung',
      emp: 'MA',
      active: 'Aktiv',
      open_requests: 'offene Anfragen',
      per_active_user: '/ aktiver Nutzer',
      actions: 'Maßnahmen',
      reallocate_btn: 'Umverteilen',
      cancel_seats_btn: 'Kündigen',
      all_requests_filled: 'Alle Anfragen gedeckt',
      no_excess_seats: 'Kein Überschuss',
      unused_to_req: 'Ungenutzt → Offene Anfragen',
      zero_requests: '0 offene Anfragen',
      cancel_n_seats: '{n} Lizenzen kündigen',
      save_mo: 'Spart {v} / Monat',
      optimized: 'Optimiert',
      done: 'Erledigt',
      dept_col: 'Abteilung',
      paid_col: 'Bezahlt',
      active_col: 'Aktiv',
      unused_col: 'Ungenutzt',
      increase_budget: 'Budget erhöhen',
      save: 'Speichern',
      ceo_only: 'Nur CEO',
      ceo_fin_only: 'Nur CEO & Finanzen',
      spend_breakdown: 'Ausgaben nach Bereich',
      ai_licenses: 'KI-Lizenzen',
      api_tokens: 'API-Tokens',
      token_usage_cost: 'Tokens & Kosten',
      tokens_col: 'Tokens',
      cost_col: 'Kosten',
      per_1m: '/ 1 Mio. Tokens',
      tokens_short: 'Tokens',
      approved_projects: 'Freigegebene Projekte',
      approved_trainings: 'Freigegebene Schulungen',
      weekly: 'Wöchentlich',
      daily: 'Täglich',
      trained: 'Geschult',
      metric_weekly: 'Wöchentliche Nutzer',
      metric_daily: 'Tägliche Nutzer',
      metric_trained: 'Geschulte MA',
      summary: 'Übersicht',
      leading: 'Spitzenreiter',
      lagging: 'Aufholbedarf',
      progress_2026: 'Verlauf 2026 (Jan–Nov)',
      click_dept_hint: 'Abteilung anklicken für Verlauf',
      all_depts_short: 'Alle Abteilungen',
      on_track: 'Im Plan',
      watch: 'Beobachten',
      action_needed: 'Handlungsbedarf',
      settings: 'Einstellungen',
      appearance: 'Darstellung',
      light: 'Hell',
      dark: 'Dunkel',
      language: 'Sprache',
      cancel: 'Abbrechen',
      submit: 'Einreichen',
      project_name: 'Projektname',
      expected_outcome: 'Erwarteter Nutzen',
      budget_eur: 'Budget (€)',
      timeline: 'Zeitraum',
      title: 'Titel',
      employees: 'Mitarbeitende',
      restricted: 'Eingeschränkt',
      nav_readiness: 'Readiness'
    }
  };

  // AI pilots & live use cases — monthly value vs. monthly run cost (Level-2 "Which pilots should we implement?")
  // trend = value per € for the last 6 months (Jun → Nov 2026)
  const PILOTS = [
    {
      id: 'quotedraft', name: 'QuoteDraft', full: 'Automated Quote & Spec Drafting', deptId: 'sales', owner: 'Marcus Weber',
      status: 'Live', since: 'Mar 2026', costMo: 3400, valueMo: 11800, employees: 50,
      result: 'Quotes 38% faster · win rate +4 pp', trend: [1.9, 2.4, 2.8, 3.1, 3.3, 3.47],
      next: 'Roll out to Apparel & Retail team (18 reps)'
    },
    {
      id: 'yarnlab', name: 'YarnLab', full: 'Yarn Formulation Assistant', deptId: 'rd', owner: 'Sarah Klein',
      status: 'Live', since: 'Feb 2026', costMo: 4600, valueMo: 13700, employees: 45,
      result: 'Lab test cycles 30% faster', trend: [2.2, 2.5, 2.6, 2.8, 2.9, 2.98],
      next: 'Connect simulation data to cut cycles further'
    },
    {
      id: 'fabricvision', name: 'FabricVision', full: 'Optical Fabric Defect Camera', deptId: 'production', owner: 'Dr. Thomas Berg',
      status: 'Pilot', since: 'Jul 2026', costMo: 4000, valueMo: 9600, employees: 90,
      result: 'Scrap −18% on 4 looms in Plant A', trend: [0.4, 0.9, 1.4, 1.8, 2.2, 2.4],
      next: 'Approve rollout to all looms (€48k) — needs works council sign-off'
    },
    {
      id: 'weaveopt', name: 'WeaveOpt', full: 'Loom Setting Optimizer', deptId: 'production', owner: 'Dr. Thomas Berg',
      status: 'Pilot', since: 'Aug 2026', costMo: 2800, valueMo: 5900, employees: 62,
      result: 'Changeover time −22%', trend: [0, 0.6, 1.1, 1.6, 1.9, 2.1],
      next: 'Blocked by ERP link for full rollout'
    },
    {
      id: 'yarnprice', name: 'YarnPrice', full: 'Raw Yarn Price Forecast', deptId: 'purchasing', owner: 'Andreas Richter',
      status: 'Pilot', since: 'Sep 2026', costMo: 1500, valueMo: 4200, employees: 12,
      result: '€35k saved on two fiber contracts', trend: [0, 0, 0, 1.2, 2.1, 2.8],
      next: 'Keep small — high value, few users'
    },
    {
      id: 'dyematch', name: 'DyeMatch', full: 'Color Recipe Matching', deptId: 'rd', owner: 'Sarah Klein',
      status: 'Pilot', since: 'Jun 2026', costMo: 1200, valueMo: 1700, employees: 38,
      result: 'First-time-right dyeing 71% → 79%', trend: [0.6, 0.8, 1.0, 1.2, 1.3, 1.42],
      next: 'Add finishing team to reach implement zone'
    },
    {
      id: 'shopfloor', name: 'ShopFloor Copilot', full: 'Shopfloor Assistant (work instructions)', deptId: 'production', owner: 'Dr. Thomas Berg',
      status: 'Pilot', since: 'May 2026', costMo: 3800, valueMo: 2900, employees: 110,
      result: 'Only 31% of operators use it weekly', trend: [0.5, 0.6, 0.6, 0.7, 0.7, 0.76],
      next: 'Fix adoption: shopfloor training wave 2 before more spend'
    },
    {
      id: 'customsai', name: 'CustomsAI', full: 'Customs Document Checker', deptId: 'logistics', owner: 'Julia Hoffmann',
      status: 'Pilot', since: 'Apr 2026', costMo: 1100, valueMo: 600, employees: 6,
      result: 'Errors flat — vendor tool covers it already', trend: [0.7, 0.6, 0.6, 0.5, 0.55, 0.55],
      next: 'Stop at end of contract (Jan 2027), save €1.1k/mo'
    }
  ];

  return {
    THRESHOLDS, TARGETS, KPI_INFO, ROLES, DEFAULT_RBAC, PILOTS,
    TOOLS, TIMEFRAMES, DEPARTMENTS, INITIAL_PROJECTS, INITIAL_TRAININGS, SYSTEMS, CULTURE_SURVEY, TREND_2026, I18N
  };
})();
