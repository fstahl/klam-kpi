# POWER&D Board KPI Report

A single-page board report that summarises POWER&D AB's monthly performance:
new business, revenue, EBITA, P/WC, billing rate, GP per employee, admin cost,
and consultant conversions — each card showing actuals against an annual
target with a 12-month sparkline.

The report is generated monthly from two source files:

| Source                   | What it gives us                                  |
| ------------------------ | ------------------------------------------------- |
| `ATL_MB*.xlsx`           | Mercur Business Control monthly scorecard export  |
| `Spiris+Tid_*.xlsx`      | Spiris consultant billing rate export             |

Both files contain sensitive financial data and are gitignored.

The full data pipeline:

```
  ATL_MB*.xlsx ──┐
                 │   pull_data.py        kpi-template.xlsx       Express + React
  Spiris*.xlsx ──┼─►  (one-shot script) ─► (Input + KPIs sheets) ─► /board-kpi/
                 │
  Input sheet  ──┘   ▲
  (manual edits)     │
                     └─ targets, billing rate, conversions, etc.
```

The Express server reads `kpi-template.xlsx` on every request, so the page
reflects whatever was last written by `pull_data.py` (or hand-edited in the
Input sheet).

---

## 1. Quick start

```bash
# one-time
npm install

# run the dashboard
npm run dev               # node --watch server.js
```

Open <http://localhost:3000> — `/` redirects to `/board-kpi/`.

To populate the report after a new month closes:

```bash
# 1. Drop the new ATL_MB and Spiris exports in the project root
# 2. Open kpi-template.xlsx → Input sheet → fill in this month's manual values
# 3. Run the pipeline
npm run pull              # python3 pull_data.py
# 4. Reload the browser
```

The smoke test verifies the pipeline end-to-end without touching real data:

```bash
npm test                  # python3 tests/test_pull_data.py
```

---

## 2. Monthly workflow

1. **Drop in the source files.** ATL Mercur export goes in the project root as
   `ATL_MB*.xlsx`; Spiris export as `Spiris*.xlsx`. The script picks up
   whichever it finds — keep just one of each.
2. **Fill in the Input sheet** of `kpi-template.xlsx`:
   - **New business** — `cm_count`, `cm_value`, `pe_count`, `pe_value` (per period).
   - **People** — `converted`, `converted_ytd`.
   - **Targets** — only need to be set once per fiscal year:
     `revenue_target_fy`, `ebita_target_fy`, `cm_count_target_fy`,
     `pe_count_target_fy`, `gp_emp_target`, `admin_target`, `pwc_target`,
     `billing_target`, `converted_goal`.
   - **Bases** — `gp_base` and `admin_base` are the monthly per-employee
     baselines (typically Jan of the current FY); used to compute the index
     shown on the GP/admin cards.
3. **Run the pipeline.** `python3 pull_data.py` reads ATL + Spiris + Input,
   writes everything (actuals, deltas, sparklines, billing history) to
   `kpi-template.xlsx`.
4. **Reload the page.** No restart needed — the server reads the workbook
   on every request.

If you re-run `pull_data.py` later in the same month, BillingHistory dedupes
by date and resorts, so multiple runs are safe.

---

## 3. Architecture

```
                                                ┌──────────────────┐
  python3 pull_data.py ──► kpi-template.xlsx ──►│  Express server  │
                                                │   (server.js)    │
                                                └────────┬─────────┘
                                                         │ /api/board-kpi
                                                         ▼
                                                ┌──────────────────┐
                                                │   React (JSX)    │
                                                │  /board-kpi/     │
                                                └──────────────────┘
```

- **`pull_data.py`** — Python script. Reads the two source workbooks plus the
  Input sheet, computes all derived KPIs (deltas vs targets, indices,
  sparklines), and writes the result back into `kpi-template.xlsx`.
- **`server.js`** — Tiny Express app. Serves the static React page and a
  single JSON endpoint, `GET /api/board-kpi`, that returns the KPIs sheet
  reshaped into a per-period payload.
- **`src/boardKpi.js`** — Reads `kpi-template.xlsx` with the `xlsx` package,
  applies the percent ×100 transform for display, and shapes the response.
- **`src/kpi-fields.json`** — Single source of truth for KPI field
  names and types. Both `pull_data.py` and `boardKpi.js` read it.
- **`public/board-kpi/`** — React app loaded via Babel-in-the-browser
  (no build step). Three components live here: [`app.jsx`](public/board-kpi/app.jsx)
  (sections + tabs), [`components.jsx`](public/board-kpi/components.jsx)
  (Sparkline, Delta pill, formatters), [`data.js`](public/board-kpi/data.js)
  (fetch wrapper).

---

## 4. The Excel template

`kpi-template.xlsx` has four sheets:

| Sheet              | Purpose                                                    |
| ------------------ | ---------------------------------------------------------- |
| `Input`            | Where you (the operator) enter monthly data and targets.   |
| `KPIs`             | Computed values, written by `pull_data.py`. Read by the API. |
| `Sparklines`       | 12-month series for each card, written by `pull_data.py`.  |
| `BillingHistory`   | Rolling 12-month billing-rate log, maintained by the script. |

### Input sheet schema

Each row is `field | description | MTD | QTD | YTD | LASTQ`. Fields are
identified by the key in column A, not by row position — you can reorder or
add section headers freely.

Three kinds of fields:

- **Per-period values** (`cm_count`, `pe_count`, `converted`, …) — fill the
  column for each period as needed.
- **Single-MTD values** (`pwc_target`, `billing_target`, `gp_base`,
  `admin_base`, all `*_target_fy`) — write once in the MTD column; the
  script propagates as needed.
- **Decimals for percentages** — anything stored as a percent goes in as a
  decimal (e.g. `0.55` for 55%). The UI applies the ×100 conversion.

### KPI fields config

`src/kpi-fields.json` declares every field exposed to the UI:

```json
"revenue":          { "type": "number" },
"revenue_delta":    { "type": "percent" },
"pwc_target":       { "type": "percent" },
```

`type` is one of `string`, `number`, or `percent`. Percent fields are
stored as decimals in Excel and rendered ×100. To add a new KPI, add
its row to the `KPIs` sheet, declare it here, then read it from your
React component as `d.<field_name>`.

---

## 5. The pipeline (`pull_data.py`)

In order, the script:

1. Loads `ATL_MB*.xlsx`, `Spiris*.xlsx`, and `kpi-template.xlsx`.
2. Computes period metadata from `Parameters!C8` (e.g. `"2603"` → March 2026,
   FY25/26 month 12, Q4) and the corresponding period-target fractions
   (MTD = 1/12, QTD = months_in_qtd/12, YTD = fy_month/12, LASTQ = 3/12).
3. Pulls fixed values from the ATL scorecard via `KPI_SOURCE` — a map of
   `(field, period) → (sheet, cell)`. Each read is type-checked
   (`atl_number()` raises a clear error if a cell is missing or non-numeric).
4. Reads manual input from the `Input` sheet.
5. Computes derived metrics:
   - GP per employee = ATL gross profit ÷ ATL avg employees
   - Admin cost per employee = `|ATL overhead|` ÷ employees
   - Indices = value ÷ (base × months_in_period) × 100 — comparable across tabs
   - Deltas = actual ÷ period-target − 1, except `pwc_delta` and
     `billing_delta` which are pp differences
6. Writes labels and ranges (`Mar 2026`, `Q4 FY25/26`, `Apr 2025 – Mar 2026`).
7. Builds 12-month sparklines from `LinkM` rows 57–68.
8. Reads the latest billing rate from Spiris column F, updates
   `BillingHistory` (overwrite-by-date + sort + cap at 12 rows), and writes
   the billing sparkline.
9. Saves `kpi-template.xlsx`.

---

## 6. Adding or changing a KPI

1. Add a row to `kpi-template.xlsx` → `KPIs` sheet (column A is the field key).
2. Declare it in `src/kpi-fields.json` with the right `type`.
3. If it comes from ATL: add an entry to `KPI_SOURCE` in `pull_data.py`.
   If it's manual: add to `MANUAL_FIELDS` (per-period) or
   `SINGLE_VALUE_FIELDS` (one MTD value propagated to all periods).
   If it's computed: add a block to `pull_data.py`.
4. Render it in [`public/board-kpi/app.jsx`](public/board-kpi/app.jsx) as
   `d.<field_name>`.

---

## 7. Testing

```bash
npm test
```

The smoke test in `tests/test_pull_data.py` builds a synthetic ATL workbook
and a fresh template in a temp directory, runs `pull_data.py` against them,
and asserts every field declared in `kpi-fields.json` is populated and key
values match expectation. It does not touch the real `kpi-template.xlsx`.

---

## 8. Troubleshooting

| Symptom                                              | Likely cause                                                                |
| ---------------------------------------------------- | --------------------------------------------------------------------------- |
| `RuntimeError: ATL cell R1U!… is empty`              | The ATL scorecard's row layout shifted; update `KPI_SOURCE` in `pull_data.py`. |
| `ATL_MB*.xlsx` not found                             | Make sure the file is in the project root, not in a subfolder.              |
| Delta pills show `—`                                 | The corresponding target is empty in the Input sheet.                       |
| GP/admin index missing                               | `gp_base` or `admin_base` is empty in the Input sheet.                      |
| Page shows old month                                 | `Parameters!C8` in the ATL file controls the period — verify the export.    |
| Field value won't render                             | Did you add it to `src/kpi-fields.json`? `pull_data.py` rejects writes to undeclared fields. |

---

## 9. Project layout

```
.
├── pull_data.py              # ATL + Spiris + Input → kpi-template.xlsx
├── kpi-template.xlsx         # Working spreadsheet (Input, KPIs, Sparklines, BillingHistory)
├── server.js                 # Express server
├── src/
│   ├── boardKpi.js           # Reads kpi-template.xlsx, shapes API response
│   ├── kpi-fields.json       # Single source of truth for field types
│   ├── config.js             # PORT
│   └── utils.js
├── public/board-kpi/         # React app (no build step — Babel in-browser)
│   ├── app.jsx
│   ├── components.jsx
│   ├── data.js
│   ├── index.html
│   ├── styles/
│   ├── fonts/
│   └── assets/
└── tests/
    └── test_pull_data.py     # End-to-end smoke test
```
