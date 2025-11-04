const { app, BrowserWindow, ipcMain, Menu } = require("electron"); // Dodaj ipcMain
const path = require("path");

// DEFINIOWANIE ZMIENEJ STORE
let store;
// ZMIENNA DEV DO ODPOWIEDNIEGO WYŚWIETLANIA
const isDev = !app.isPackaged;

// FUNKCJA TWORZĄCA ONKO
const createWindow = async () => {
  const { default: Store } = await import("electron-store");
  store = new Store();

  // USTAWIENIA OKNA
  const win = new BrowserWindow({
    width: 350,
    height: 450,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Funkcja do aktualizowania stanu menu apliakcji
  function updateMenu(state) {
    const isMac = process.platform === "darwin";
    const menu = Menu.getApplicationMenu();
    if (!menu) return;

    // Pobierz referencje do opcji menu po ich ID
    const startWorkItem = menu.getMenuItemById("start-work");
    const startBreakItem = menu.getMenuItemById("start-break");
    const stopBreakItem = menu.getMenuItemById("end-break");
    const stopWorkItem = menu.getMenuItemById("end-work");

    // Ustaw stan 'enabled' na podstawie stanu aplikacji z Reacta
    switch (state) {
      case "IDLE":
        startWorkItem.enabled = true;
        startBreakItem.enabled = false;
        stopBreakItem.enabled = false;
        stopWorkItem.enabled = false;
        break;
      case "WORKING":
        startWorkItem.enabled = false;
        startBreakItem.enabled = true;
        stopBreakItem.enabled = false;
        stopWorkItem.enabled = true;
        break;
      case "BREAK":
        startWorkItem.enabled = false;
        startBreakItem.enabled = false;
        stopBreakItem.enabled = true;
        stopWorkItem.enabled = false;
        break;
    }
  }

  //Tworzenie template dla menu
  const template = [
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: "about" },
              { type: "separator" },
              { role: "services" },
              { type: "separator" },
              { role: "hide" },
              { role: "hideOthers" },
              { role: "unhide" },
              { type: "separator" },
              { role: "quit" },
            ],
          },
        ]
      : []),
    {
      label: "Akcje",
      submenu: [
        {
          id: "start-work",
          label: "Rozpocznij pracę",
          accelerator: "CmdOrCtrl+W",
          enabled: true,
          click: () => win.webContents.send("action-button", "START-WORK"),
        },
        {
          id: "start-break",
          label: "Rozpocznij przerwę",
          accelerator: "CmdOrCtrl+B",
          enabled: false,
          click: () => win.webContents.send("action-button", "START-BREAK"),
        },
        {
          id: "end-break",
          label: "Zakończ przerwę",
          accelerator: "CmdOrCtrl+E",
          enabled: false,
          click: () => win.webContents.send("action-button", "END-BREAK"),
        },
        {
          id: "end-work",
          label: "Zakończ pracę",
          accelerator: "CmdOrCtrl+S",
          enabled: false,
          click: () => win.webContents.send("action-button", "END-WORK"),
        },
      ],
    },
  ];

  // Tworzenie menu z tempaltu
  const menu = Menu.buildFromTemplate(template);
  // Ustawianie menu jako głowne dla aplikacji
  Menu.setApplicationMenu(menu);

  // Tworzenie połączenia z frontendem
  ipcMain.on("update-menu-state", (event, newState) => {
    console.log(`MAIN: Otrzymano nowy stan: ${newState}. Aktualizuję menu.`);
    updateMenu(newState);
  });

  // Logika ładowania widoku
  if (isDev) {
    // W trybie deweloperskim, ładuję URL z serwera Vite
    win.loadURL("http://localhost:5173"); // Domyślny port Vite, sprawdź w terminalu
    win.webContents.openDevTools(); // Otwórz narzędzia deweloperskie
  } else {
    // W trybie produkcyjnym, ładuje zbudowany plik HTML Reacta
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
