const { app, BrowserWindow, ipcMain, Menu } = require("electron"); // Dodaj ipcMain
const path = require("path");

let store;

// Zamiast polegać na NODE_ENV, użyj wbudowanej właściwości Electrona
const isDev = !app.isPackaged;

const createWindow = async () => {
  const { default: Store } = await import("electron-store");
  store = new Store(); // <-- Utwórz instancję dopiero po zaimportowaniu

  const win = new BrowserWindow({
    width: 350,
    height: 450,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      // Ważne dla bezpieczeństa i komunikacji React <-> Electronn
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  //Tworzenie menu 
  const template = [
    // Pierwszy element na macOS to zawsze menu aplikacji
    {
      label: app.getName(), // Nazwa aplikacji (np. "Licznik")
      submenu: [
        // { role: 'about', label: 'O programie Licznik' },
        // { type: 'separator' },
        { role: 'quit', label: 'Zakończ Licznik' }
      ]
    },
    {
      label: "Akcje",
      submenu: [
        {label: "Rozpocznij prace", enabled: true},
        {label: "Rozpocznij przerwe", enabled: false},
        {label: "Zakończ przerwe", enabled: false},
        {label: "Zakończ prace", enabled: false},
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);

  // 3. Ustaw to menu jako główne menu aplikacji
  Menu.setApplicationMenu(menu);

  // Logika ładowania widoku
  if (isDev) {
    // W trybie deweloperskim, ładuj URL z serwera Vite
    win.loadURL("http://localhost:5173"); // Domyślny port Vite, sprawdź w terminalu
    win.webContents.openDevTools(); // Otwórz narzędzia deweloperskie
  } else {
    // W trybie produkcyjnym, ładuj zbudowany plik HTML Reacta
    win.loadFile(path.join(__dirname, "../renderer/dist/index.html"));
    win.setMenu(null);
  }
};

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Nasłuchuj na prośbę o dane z renderera
ipcMain.handle("get-store-value", (event, key) => {
  return store.get(key);
});

// Nasłuchuj na prośbę o zapis danych
ipcMain.handle("set-store-value", (event, key, value) => {
  store.set(key, value);
  return true;
});
