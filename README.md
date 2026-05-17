# Kläm KPI

An on-premise KPI dashboard for small companies — distributed as a native desktop app (Electron). Fill your spreadsheet, open the app, present.

Originally built as an internal board report for POWER&D AB; now being generalised into a standalone product.

---

## Overview

```
  data.xlsx ──────────────────► Express (server.js)
  (you own this — fill it however       │  /api/board-kpi
   you like: manually, Power Query,     │  /api/config
   your own script, …)                  ▼
                                React app (Vite build → dist/)
                                        │
                                Electron window
```

The Electron app wraps the Express server and React dashboard in a single desktop window. No browser needed. The server re-reads the workbook on every request — no restart needed after updating the spreadsheet.

---

## Quick start

```bash
npm install          # install Node dependencies
npm run build        # compile the React frontend (Vite → dist/)
npm run electron     # build + launch the desktop app
```

---

## Packaging a distributable

```bash
npm run package:mac  # → dist/  (macOS .dmg for the current machine architecture)
npm run package:win  # → dist/  (Windows .exe installer via NSIS)
npm run package      # → both (or current platform default)
```

`electron-builder` is used for packaging. The first time a packaged app launches it
creates **`~/Documents/Kläm KPI/`** and copies the bundled `data.xlsx` and
`kpi-config.json` defaults there. On subsequent launches the user's own files are
used — they are never overwritten.

**Data → Open Data Folder** (`⌘⇧O`) opens `~/Documents/Kläm KPI/` in Finder so
the user can swap in a new `data.xlsx` without needing a terminal.

### App icon

Place a **1024×1024 `.icns`** file at `build/icon.icns` (macOS) and/or a
**256×256 `.ico`** at `build/icon.ico` (Windows) before packaging — `electron-builder`
will pick them up automatically. Without them the default Electron icon is used.

### Code signing (macOS)

Without a valid Apple Developer ID the app will be blocked by Gatekeeper. For
internal distribution on known machines, recipients can bypass this once:

```bash
xattr -d com.apple.quarantine "/Applications/Kläm KPI.app"
```

For wider distribution, sign and notarise via Xcode / `electron-builder`'s
`CSC_LINK` / `CSC_KEY_PASSWORD` environment variables.

---

## Monthly workflow

1. Update `data.xlsx` with the latest figures (manually, or via your own script).
2. In the app: **Data → Reload Dashboard** (`⌘⇧R`) — the server re-reads the workbook immediately.
3. **Data → Open Data Folder** (`⌘⇧O`) — opens the app directory in Finder if you need to swap files.

---

## Dashboard configuration (`kpi-config.json`)

All dashboard layout and branding is stored in `kpi-config.json` in the project root. The file is human-readable and version-controllable; it is also written by the in-app admin mode.

```json
{
  "branding": {
    "logoLight": "/assets/logo-primary-colour.png",
    "logoDark":  "/assets/logo-primary-white.png"
  },
  "header": {
    "title":  "Board KPI Report",
    "meta":   "Monthly Board Update",
    "source": "ERP, CRM, HRIS"
  },
  "intro": {
    "tagline":     "{month} at a glance.",
    "description": "Nine board KPIs across commercial growth, operating efficiency, and people."
  },
  "footer": "Confidential · Board materials",
  "sections": [
    {
      "id":    "commercial",
      "label": "Commercial",
      "hint":  "New business & financial performance",
      "cols":  3,
      "cards": [
        {
          "id":           "revenue",
          "field":        "revenue",
          "label":        "Revenue",
          "unit":         "kSEK",
          "spark":        "rev",
          "comparison":   "target"
        }
      ]
    }
  ]
}
```

### Card schema

| Property | Type | Description |
|---|---|---|
| `field` | string | Field key matching a row in the KPIs sheet of `data.xlsx` |
| `label` | string | Display label |
| `unit` | string | Unit suffix (kSEK, %, …) |
| `tag` | string? | Small badge (e.g. "Consulting") |
| `spark` | string? | Sparkline key matching a row in the Sparklines sheet of `data.xlsx` |
| `comparison` | string | `target` · `prev_month` · `prev_year` · `lastq` · `none` |
| `invert` | bool? | Flip delta colour (lower is better, e.g. costs) |
| `progress` | bool? | Show progress bar toward target |
| `target_field` | string? | Field name for the target value |
| `bar_mode` | string? | `ratio` (value÷target) or `absolute` (value as %) |
| `type` | string? | `value` (default) or `pair` (two sub-values) |
| `delta_field` | string? | Override for the pre-computed delta field (default: `{field}_delta`) |
| `hero` | bool? | Render as a full-width accent-flooded hero card (one per section) |
| `narrative` | string? | Short supporting text shown below the delta pill on a hero card |
| `highlight` | bool? | Include in the highlights ribbon at the top of the dashboard |

---

## Admin mode

Click the **padlock icon** in the toolbar to enter admin mode. Changes are applied to a draft copy of the config and only saved when you click **Save changes**.

In admin mode you can:

- **Replace the logo** — click the logo to open a file picker. Uploads are stored in `data/logos/` and referenced by path.
- **Edit the top-right text** — title, meta line, and source become inline text fields.
- **Edit the intro** — the tagline and description become editable. Use `{month}` in the tagline as a placeholder for the current month name.
- **Edit the footer text**.
- **Reorder sections** — drag the handle on the left of each section header.
- **Rename / add / delete sections** — inline rename, trash icon to delete (with confirmation), and **Add section** in the bottom bar.
- **Set section column count** — 1, 2, 3, or 4 columns per section.
- **Add cards** — "+ Add card" opens a picker showing all fields from the KPI catalogue not yet on the board.
- **Edit cards** — pencil icon on each card opens a modal for label, unit, tag, comparison type, sparkline series, progress bar options, and invert.
- **Reorder cards** — drag handles within each section.
- **Delete cards** — trash icon.

---

## Architecture

### Process layout

```
Electron main process (electron/main.js)
├── imports server.js  →  Express on :3000
│     ├── GET  /api/board-kpi      reads data.xlsx
│     ├── GET  /api/config         reads kpi-config.json
│     ├── POST /api/config         writes kpi-config.json
│     ├── GET  /api/kpi-fields     derived from KPIs sheet in data.xlsx
│     ├── POST /api/upload-logo    saves to data/logos/
│     ├── static /dist/            Vite build output
│     ├── static /public/          fonts (/fonts/), default logos (/assets/)
│     └── static /data/            user-uploaded logos
└── BrowserWindow  →  http://localhost:3000
```

### Frontend

The React app is built with Vite (`src/frontend/` → `dist/`). It fetches `/api/board-kpi`, `/api/config`, and `/api/kpi-fields` on startup and re-renders from config.

Key source files:

| File | Role |
|---|---|
| `src/frontend/App.jsx` | Root component; view mode + admin mode state |
| `src/frontend/components/KPICard.jsx` | Generic config-driven card renderer |
| `src/frontend/admin/AdminSection.jsx` | DnD section/card management |
| `src/frontend/admin/CardEditor.jsx` | Card edit modal |
| `src/frontend/admin/CardPicker.jsx` | Add card modal |
| `src/frontend/utils/comparison.js` | Delta computation for all comparison types |

### Backend

| File | Role |
|---|---|
| `server.js` | Express app — API routes + static serving |
| `src/boardKpi.js` | Reads `data.xlsx`, derives field catalogue and KPI data |
| `src/config.js` | PORT from `.env` (default 3000) |

---

## The Excel template

`data.xlsx` is the single data source. You own it — fill it however suits your workflow: manually, via Power Query, a Python script, or anything else.

### Required sheets

| Sheet | Purpose |
|---|---|
| `KPIs` | One row per metric. Columns: **Field \| Type \| MTD \| QTD \| YTD \| LASTQ** |
| `Sparklines` | 12-month trailing series. Columns: **Key \| month-1 \| … \| month-12** |

Additional sheets (e.g. `Input`, raw source data) are ignored by the app.

### KPIs sheet format

```
Field        | Type    | MTD     | QTD     | YTD     | LASTQ
label        | string  | Apr 2026| Q4      | YTD     | Q3
range        | string  | Apr '26 | …       | …       | …
revenue      | number  | 3609    | 11706   | 3609    | 8979
margin       | percent | 0.105   | 0.118   | 0.105   | 0.112
```

- **Field** — the key used in `kpi-config.json` card definitions
- **Type** — `number`, `percent` (stored 0–1, displayed ×100), or `string`
- **Period columns** — any names; the app exposes MTD / QTD / YTD / LASTQ via the period tabs

### Sparklines sheet format

```
Key  | Jan  | Feb  | Mar  | … | Dec
rev  | 3100 | 3400 | 3609 | … | …
```

The `Key` value maps to the `spark` property of a card in `kpi-config.json`.

---

## Adding a KPI

1. Add a row to the `KPIs` sheet: `field_name | number | <values…>`
2. Add a card in admin mode (padlock icon → **+ Add card**) — the new field appears in the picker automatically.
3. If the field needs a delta comparison against a target, add a companion `field_name_delta` row of type `percent` with the pre-computed delta value (positive = above target).

---

## Scripts

| Command | What it does |
|---|---|
| `npm run build` | Compile React frontend (Vite → `dist/`) |
| `npm run electron` | Build frontend + launch Electron desktop app |
| `npm run dev` | Vite HMR on :5173 + Express watch on :3000 (for rapid UI iteration) |
| `npm start` | Express only (no Vite, no Electron) |
| `npm run package:mac` | Build distributable macOS `.dmg` (via electron-builder) |
| `npm run package:win` | Build distributable Windows `.exe` installer |

---

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Delta pills show `—` | The `field_delta` row is missing or empty in the KPIs sheet |
| Field not in card picker | The row is missing from the KPIs sheet, or the workbook hasn't been saved |
| Page shows stale data | Hit **Data → Reload Dashboard** (`⌘⇧R`) after saving the workbook |
| Admin changes not saved | Check browser console — server must be running and `kpi-config.json` writable |
| Electron shows `EADDRINUSE :3000` | A leftover server is holding the port. Run `lsof -ti :3000 \| xargs kill -9` then retry |

---

## Project layout

```
.
├── electron/
│   ├── main.js               # Electron entry point; spawns Express in-process
│   └── preload.cjs           # contextBridge IPC surface (About / License menu items)
├── build/
│   ├── icon.icns             # macOS app icon (provide your own, 1024×1024)
│   └── icon.ico              # Windows app icon (provide your own, 256×256)
├── src/
│   ├── frontend/             # React app source (Vite)
│   │   ├── index.html
│   │   ├── main.jsx          # Entry: fetches data + config, mounts App
│   │   ├── App.jsx           # Root component (view + admin mode)
│   │   ├── components/       # Sparkline, Delta, KPICard, TopBar, Footer, …
│   │   ├── admin/            # AdminBar, AdminSection, CardEditor, CardPicker
│   │   ├── utils/            # formatters.js, comparison.js
│   │   └── styles/           # tokens.css, dashboard.css, admin.css
│   ├── boardKpi.js           # Reads data.xlsx; derives field catalogue + KPI data
│   └── config.js             # PORT from .env (default 3000)
├── dist/                     # Vite build output (gitignored)
├── public/
│   ├── fonts/                # Red Hat Display TTF files (served at /fonts/)
│   └── assets/               # Default logos (served at /assets/)
├── data/
│   └── logos/                # User-uploaded logos (gitignored)
├── examples/
│   └── pull_data_powerd.py   # POWER&D-specific pipeline (reference only)
├── server.js                 # Express server
├── vite.config.js            # Vite config (root: src/frontend, out: dist/)
├── kpi-config.json           # Dashboard layout + branding config
└── data.xlsx         # Your data — KPIs sheet + Sparklines sheet
```

---

## License

Copyright (c) 2026 Fredrik Ståhl. Proprietary — restricted to internal use within the Addtech AB group. See [LICENSE](LICENSE) for terms.

The software is provided without warranty of any kind. The author accepts no liability for the accuracy of any figures displayed in the dashboard or for any decisions made on the basis of those figures.
