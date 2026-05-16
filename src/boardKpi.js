import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { read, utils } from "xlsx";

const TEMPLATE_PATH = resolve(process.cwd(), "data.xlsx");

// Parse the workbook and return both KPI data and the field catalogue.
async function parseWorkbook() {
  const buf = await readFile(TEMPLATE_PATH);
  const wb  = read(buf, { type: "buffer" });

  // ── KPIs sheet ────────────────────────────────────────────────────
  // Expected columns: Field | Type | MTD | QTD | YTD | LASTQ | …
  //   Field  — key used in kpi-config.json cards
  //   Type   — "number", "percent" (stored as 0–1, displayed ×100), or "string"
  //   Periods — one column each; the header row names them (MTD, QTD, YTD, LASTQ, …)
  const kpiSheet = wb.Sheets["KPIs"];
  if (!kpiSheet) throw new Error("Workbook is missing the 'KPIs' sheet");

  const kpiRows  = utils.sheet_to_json(kpiSheet, { header: 1, defval: null });
  const [headerRow, ...dataRows] = kpiRows;

  const hasTypeCol  = String(headerRow[1] ?? "").trim().toLowerCase() === "type";
  const periodStart = hasTypeCol ? 2 : 1;
  const periods     = headerRow.slice(periodStart).filter(Boolean);

  const scalars   = {};  // field → { period → value }
  const fieldsMap = {};  // field → { type }

  for (const row of dataRows) {
    const field = String(row[0] ?? "").trim();
    if (!field) continue;

    const type = hasTypeCol
      ? String(row[1] ?? "number").trim().toLowerCase()
      : "number";

    fieldsMap[field] = { type };
    scalars[field]   = {};

    periods.forEach((period, i) => {
      const raw = row[periodStart + i];
      let value;
      if (raw == null || raw === "") {
        value = null;
      } else if (type === "number" || type === "percent") {
        value = Number(raw);
        if (type === "percent") value = value * 100;
      } else {
        value = String(raw);
      }
      scalars[field][period] = value;
    });
  }

  // ── Sparklines sheet ─────────────────────────────────────────────
  // Columns: Key | month-1 | month-2 | … | month-12
  const sparkSheet = wb.Sheets["Sparklines"];
  if (!sparkSheet) throw new Error("Workbook is missing the 'Sparklines' sheet");

  const sparkRows = utils.sheet_to_json(sparkSheet, { header: 1, defval: 0 });
  const [, ...sparkData] = sparkRows; // skip header row

  const sparks = {};
  for (const row of sparkData) {
    const key = String(row[0]).trim();
    if (!key) continue;
    const cells = row.slice(1);
    let end = cells.length;
    while (end > 0 && (cells[end - 1] == null || cells[end - 1] === "")) end--;
    sparks[key] = cells.slice(0, end).map(Number);
  }

  // ── Assemble period objects ───────────────────────────────────────
  const kpiData = {};
  for (const period of periods) {
    const d = {};
    for (const [field, byPeriod] of Object.entries(scalars)) {
      d[field] = byPeriod[period];
    }
    d.sparks = sparks;
    kpiData[period] = d;
  }

  return { kpiData, fieldsMap };
}

/** Returns KPI data keyed by period: { MTD: {...}, QTD: {...}, … } */
export async function readBoardKpiData() {
  const { kpiData } = await parseWorkbook();
  return kpiData;
}

/** Returns the field catalogue derived from the KPIs sheet: { fields: { key: { type } } } */
export async function readKpiFields() {
  const { fieldsMap } = await parseWorkbook();
  return { fields: fieldsMap };
}
