// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Funkcja do zapisu
setStoreValue: async (key, value) => {
  return await ipcRenderer.invoke('set-store-value', key, value);
},  // Funkcja do odczytu (asynchroniczna)
  getStoreValue: (key) => ipcRenderer.invoke('get-store-value', key),
});