const { app, BrowserWindow, ipcMain } = require('electron'); // Dodaj ipcMain
const path = require('path');

let store;

const createWindow = async () => {
  const { default: Store } = await import('electron-store');
  store = new Store(); // <-- Utwórz instancję dopiero po zaimportowaniu

  const win = new BrowserWindow({
    width: 350,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.loadFile(path.join(__dirname, 'index.html'));
};

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Nasłuchuj na prośbę o dane z renderera
ipcMain.handle('get-store-value', (event, key) => {
  return store.get(key);
});

// Nasłuchuj na prośbę o zapis danych
ipcMain.handle('set-store-value', (event, key, value) => {
  store.set(key, value);
  return true; // Odsyłamy potwierdzenie, na które czeka 'await'
});