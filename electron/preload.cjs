// Preload script — runs in the renderer context with Node access.
// Uses contextBridge to safely expose a minimal IPC surface.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  /** Call cb({ version }) when the main process fires 'show-about'. */
  onShowAbout(cb) {
    const handler = (_event, payload) => cb(payload);
    ipcRenderer.on('show-about', handler);
    return () => ipcRenderer.removeListener('show-about', handler);
  },
  /** Call cb() when the main process fires 'show-license'. */
  onShowLicense(cb) {
    const handler = () => cb();
    ipcRenderer.on('show-license', handler);
    return () => ipcRenderer.removeListener('show-license', handler);
  },
});
