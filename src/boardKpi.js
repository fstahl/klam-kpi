import { readFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { read, utils } from "xlsx";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATE_PATH = resolve(process.cwd(), "kpi-template.xlsx");
const FIELDS_PATH   = resolve(__dirname, "kpi-fields.json");

// Single source of truth for field types — see src/kpi-fields.json
const fieldsConfig = JSON.parse(readFileSync(FIELDS_PATH, "utf8"));
const NUMERIC_FIELDS = new Set();
const PCT_FIELDS     = new Set();
for (const [name, meta] of Object.entries(fieldsConfig.fields)) {
  if (meta.type === "number" || meta.type === "percent") NUMERIC_FIELDS.add(name);
  if (meta.type === "percent") PCT_FIELDS.add(name);
}

export async function readBoardKpiData() {
  const buf = await readFile(TEMPLATE_PATH);
  const wb = read(buf, { type: "buffer" });

  // ── Parse KPIs sheet ──────────────────────────────────────────
  const kpiSheet = wb.Sheets["KPIs"];
  if (!kpiSheet) throw new Error("Workbook is missing the 'KPIs' sheet");

  // rows[0] = header ["Field","MTD","QTD","YTD","LASTQ"]
  // defval: null preserves empty cells so the UI can render them as "—"
  const kpiRows = utils.sheet_to_json(kpiSheet, { header: 1, defval: null });
  const [headerRow, ...dataRows] = kpiRows;
  const periods = headerRow.slice(1); // ["MTD","QTD","YTD","LASTQ"]

  const scalars = {};
  for (const row of dataRows) {
    const field = String(row[0] ?? "").trim();
    if (!field) continue;
    scalars[field] = {};
    periods.forEach((p, i) => {
      const raw = row[i + 1];
      let value;
      if (raw == null || raw === "") {
        value = null;
      } else if (NUMERIC_FIELDS.has(field)) {
        value = Number(raw);
        if (PCT_FIELDS.has(field)) value = value * 100;
      } else {
        value = String(raw);
      }
      scalars[field][p] = value;
    });
  }

  // ── Parse Sparklines sheet ────────────────────────────────────
  const sparkSheet = wb.Sheets["Sparklines"];
  if (!sparkSheet) throw new Error("Workbook is missing the 'Sparklines' sheet");

  const sparkRows = utils.sheet_to_json(sparkSheet, { header: 1, defval: 0 });
  const [, ...sparkData] = sparkRows; // skip header row

  const sparks = {};
  for (const row of sparkData) {
    const key = String(row[0]).trim();
    if (!key) continue;
    // Drop trailing null/undefined cells so partial series don't render as zeros
    const cells = row.slice(1);
    let end = cells.length;
    while (end > 0 && (cells[end - 1] == null || cells[end - 1] === "")) end--;
    sparks[key] = cells.slice(0, end).map(Number);
  }

  // ── Assemble KPI_DATA shape ───────────────────────────────────
  const result = {};
  for (const period of periods) {
    const d = {};
    for (const [field, byPeriod] of Object.entries(scalars)) {
      d[field] = byPeriod[period];
    }
    d.sparks = sparks; // sparklines are period-agnostic in the template
    result[period] = d;
  }

  return result;
}
