import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "./src/config.js";
import { readBoardKpiData } from "./src/boardKpi.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.get("/", (_req, res) => res.redirect("/board-kpi/"));
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

app.get("/api/board-kpi", async (_req, res) => {
  try {
    const data = await readBoardKpiData();
    res.json(data);
  } catch (error) {
    res.status(500).json({
      error: "Failed to read KPI spreadsheet",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

app.listen(config.port, () => {
  console.log(`Dashboard running on http://localhost:${config.port}`);
});
