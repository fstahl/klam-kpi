// Preload script — runs in the renderer context with Node access.
// Uses contextBridge to safely expose a minimal IPC surface.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  /** Call cb({ version }) when the main process fires 'show-about'. */
  onShowAbout(cb) {
    const handler = (_event, payload) => cb(payload);
    ipcRenderer.on('show-about', handler);
    // Return a cleanup function so the React effect can remove the listener.
    return () => ipcRenderer.removeListener('show-about', handler);
  },
});
