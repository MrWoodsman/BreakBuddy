// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Funkcja do zapisu
  setStoreValue: async (key, value) => {
    return await ipcRenderer.invoke('set-store-value', key, value);
  },
  // Funkcja do odczytu (asynchroniczna)
  getStoreValue: (key) => ipcRenderer.invoke('get-store-value', key),

  onMenuAction: (callback) => {
    const listener = (event, action) => callback(action);
    ipcRenderer.on('action-button', listener);

    // Zwróć funkcję, która usunie ten konkretny nasłuchiwacz
    return () => {
      ipcRenderer.removeListener('action-button', listener);
    };
  },

  updateMenuState: (newState) => ipcRenderer.send('update-menu-state', newState)
});