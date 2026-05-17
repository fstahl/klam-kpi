import { app, BrowserWindow, Menu, shell, ipcMain } from 'electron';
import { fileURLToPath } from 'url';
import { copyFile, mkdir, access } from 'node:fs/promises';
import path from 'path';
import http from 'http';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.name = 'Kläm KPI';

// ── Data directory ─────────────────────────────────────────────────────────
// In dev:       project root  (files already exist here)
// In packaged:  ~/Documents/Kläm KPI/  (created on first launch)
const DATA_DIR = app.isPackaged
  ? path.join(app.getPath('documents'), 'Kläm KPI')
  : path.join(__dirname, '..');

// Expose to server.js and boardKpi.js before they are imported.
process.env.KLAMKPI_DATA_DIR = DATA_DIR;

// ── First-launch setup ────────────────────────────────────────────────────
// Creates ~/Documents/Kläm KPI/ and copies the bundled defaults into it the
// first time the packaged app runs. Existing files are never overwritten so
// user data is always preserved.
if (app.isPackaged) {
  await mkdir(DATA_DIR, { recursive: true });

  const bundled = process.resourcesPath; // Contents/Resources/
  for (const file of ['data.xlsx', 'kpi-config.json']) {
    const dst = path.join(DATA_DIR, file);
    try {
      await access(dst); // already exists — leave it alone
    } catch {
      await copyFile(path.join(bundled, file), dst);
    }
  }
}

// ── Express server ─────────────────────────────────────────────────────────
// Run in-process. EADDRINUSE is handled inside server.js via the server
// 'error' event. Any synchronous module-level throw here is still fatal.
await import('../server.js');

function waitForServer(port, timeout = 10_000) {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + timeout;
    const check = () => {
      const req = http.get(`http://localhost:${port}/api/health`, (res) => {
        res.resume();
        if (res.statusCode === 200) resolve();
        else retry();
      });
      req.on('error', retry);
    };
    const retry = () => {
      if (Date.now() >= deadline) reject(new Error('Express server did not start within 10 s'));
      else setTimeout(check, 200);
    };
    check();
  });
}

function buildMenu(win) {
  const isMac = process.platform === 'darwin';

  const template = [
    ...(isMac
      ? [{ label: app.name, submenu: [
          {
            label: `About ${app.name}`,
            click: () => win.webContents.send('show-about', { version: app.getVersion() }),
          },
          {
            label: 'View License',
            click: () => win.webContents.send('show-license'),
          },
          { type: 'separator' },
          { role: 'services' },
          { type: 'separator' },
          { role: 'hide' },
          { role: 'hideOthers' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'quit' },
        ]}]
      : [{
          label: 'File',
          submenu: [
            {
              label: `About ${app.name}`,
              click: () => win.webContents.send('show-about', { version: app.getVersion() }),
            },
            {
              label: 'View License',
              click: () => win.webContents.send('show-license'),
            },
            { type: 'separator' },
            { role: 'quit' },
          ],
        }]),

    {
      label: 'Data',
      submenu: [
        {
          label: 'Open Data Folder',
          accelerator: 'CmdOrCtrl+Shift+O',
          click: () => shell.openPath(DATA_DIR),
        },
        {
          label: 'Reload Dashboard',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: () => win.webContents.reload(),
        },
      ],
    },

    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },

    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac
          ? [{ type: 'separator' }, { role: 'front' }]
          : [{ role: 'close' }]),
      ],
    },
  ];

  return Menu.buildFromTemplate(template);
}

async function createWindow() {
  await waitForServer(3000);

  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: 'Kläm KPI',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  Menu.setApplicationMenu(buildMenu(win));
  win.loadURL('http://localhost:3000');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
