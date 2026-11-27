# NuTex Inc. — AI Executive Dashboard

Executive AI governance & adoption dashboard prototype for **Chris Turner (CEO, NuTex Inc.)** and 5 department VPs across **300 employees** and **6 departments** (R&D, Marketing, Sales, Production, Logistics, Purchasing).

Built with zero external dependencies (pure HTML, CSS, vanilla JS & SVG) — runs 100% offline in any browser.

## Quick Start

Open `index.html` directly in any browser, or serve locally:

```bash
python3 -m http.server 8080
```

Then open http://localhost:8080.

## Views

1. **Overview** — Single-screen executive summary with prioritized CEO Decisions (or VP To-dos), Monthly Budget & API token spend, 4-stage AI Adoption Funnel (`All → AI Target Group → Trained → Weekly Users`), Department & Tool breakdowns, and an interactive **Technical Roadmap** (`Data` & `Technology` lanes with hover/keyboard-focus cards and critical-path highlighting).
2. **Departments** — Weekly / Daily / Trained department benchmarks with VP highlights and an interactive 2026 progress chart (`Jan–Nov`).
3. **Culture** — Monthly 5-question employee AI pulse survey, Top-5 Most Wanted AI Tools ranking, and Culture Progress over time (`Jan–Nov`).
4. **Projects** — Live AI project proposal & CEO approval workflow (`Pending`, `Approved`, `Declined`) persisted in `localStorage`.
5. **Trainings** — Training coverage by department and live training request / approval workflow.
6. **Licenses** — Paid → Assigned → Active license funnel with live seat reallocation and cancellation actions.
7. **Budget** *(CEO only)* — Monthly AI spend breakdown (Licenses, API Tokens, Projects, Trainings), per-department token cost tracking, and live budget adjustments.

## Features

- **Role Switcher:** Switch live between CEO (`Chris Turner`) and all 5 VPs (`Budget` tab automatically hidden for VPs).
- **Global Filters:** Filter by Department and Month (`Jan–Nov 2026`) with 1-click reset.
- **Appearance & Language:** Live **Light / Dark Mode** and **English / German (EN / DE)** switcher in Settings (`⚙`).
- **Native PowerPoint Export (`.pptx`):** Generates a 6-slide executive deck offline matching the selected month, role, language, and theme.
- **Structured PDF Export:** Full-bleed Light & Dark mode print layout.
