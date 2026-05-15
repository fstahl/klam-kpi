import { app, BrowserWindow, Menu, shell } from 'electron';
import { fileURLToPath } from 'url';
import path from 'path';
import http from 'http';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_DIR = path.join(__dirname, '..');

app.name = 'Kläm KPI';

// Run Express server in-process. EADDRINUSE is handled inside server.js via
// the server 'error' event — it logs a warning and continues. Any synchronous
// module-level throw here (e.g. import resolution failure) is still fatal.
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
          { role: 'about' },
          { type: 'separator' },
          { role: 'services' },
          { type: 'separator' },
          { role: 'hide' },
          { role: 'hideOthers' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'quit' },
        ]}]
      : [{ label: 'File', submenu: [{ role: 'quit' }] }]),

    {
      label: 'Data',
      submenu: [
        {
          label: 'Open Data Folder',
          accelerator: 'CmdOrCtrl+Shift+O',
          click: () => shell.openPath(APP_DIR),
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
