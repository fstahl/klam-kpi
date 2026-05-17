import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { config } from "./src/config.js";
import { readBoardKpiData, readKpiFields } from "./src/boardKpi.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// DATA_DIR is set by electron/main.js before this module is imported so that
// the same path logic works in both dev (project root) and packaged builds
// (~/Documents/Kläm KPI/).
const DATA_DIR = process.env.KLAMKPI_DATA_DIR || __dirname;
const CONFIG_PATH = path.join(DATA_DIR, "kpi-config.json");

const app = express();
app.use(express.json({ limit: "20mb" }));

// Redirect legacy path so cached browser redirects don't land on the old app
app.use("/board-kpi", (_req, res) => res.redirect("/"));

// Vite build output first, then legacy public/ for fonts/assets
app.use(express.static(path.join(__dirname, "dist")));
app.use(express.static(path.join(__dirname, "public")));
// Serve user-uploaded logos from the data directory (writable in both dev and packaged)
app.use("/data", express.static(path.join(DATA_DIR, "data")));

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

app.get("/api/config", async (_req, res) => {
  try {
    const raw = await readFile(CONFIG_PATH, "utf8");
    res.json(JSON.parse(raw));
  } catch {
    res.status(404).json({ error: "kpi-config.json not found" });
  }
});

app.post("/api/config", async (req, res) => {
  try {
    await writeFile(CONFIG_PATH, JSON.stringify(req.body, null, 2), "utf8");
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to save config", details: String(error) });
  }
});

app.get("/api/kpi-fields", async (_req, res) => {
  try {
    res.json(await readKpiFields());
  } catch (error) {
    res.status(500).json({ error: "Failed to read KPI fields", details: String(error) });
  }
});

app.post("/api/upload-logo", async (req, res) => {
  try {
    const { data, filename } = req.body;
    if (!data || !filename) return res.status(400).json({ error: "Missing data or filename" });
    const ext = path.extname(filename) || ".png";
    const outName = `logo_${Date.now()}${ext}`;
    const dir = path.join(DATA_DIR, "data", "logos");
    await mkdir(dir, { recursive: true });
    const base64 = data.replace(/^data:image\/\w+;base64,/, "");
    await writeFile(path.join(dir, outName), Buffer.from(base64, "base64"));
    res.json({ path: `/data/logos/${outName}` });
  } catch (error) {
    res.status(500).json({ error: "Upload failed", details: String(error) });
  }
});

const server = app.listen(config.port, () => {
  console.log(`Dashboard running on http://localhost:${config.port}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${config.port} already in use — reusing existing server`);
  } else {
    throw err;
  }
});
