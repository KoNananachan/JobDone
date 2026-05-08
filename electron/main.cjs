const { app, BrowserWindow, ipcMain, screen, Tray, Menu, nativeImage } = require('electron');
const path = require('node:path');
const fs = require('node:fs');

const isDev = process.env.NODE_ENV === 'development';
const userDataDir = app.getPath('userData');
const dataFile = path.join(userDataDir, 'jobdone.json');

let mainWindow = null;
let tray = null;

function readData() {
  try {
    if (!fs.existsSync(dataFile)) return { tasks: [], settings: {} };
    const raw = fs.readFileSync(dataFile, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('readData error', err);
    return { tasks: [], settings: {} };
  }
}

function writeData(data) {
  try {
    fs.mkdirSync(path.dirname(dataFile), { recursive: true });
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('writeData error', err);
    return false;
  }
}

function createWindow() {
  const display = screen.getPrimaryDisplay();
  const { width: sw, height: sh } = display.workAreaSize;
  const winWidth = 320;
  const winHeight = 400;

  mainWindow = new BrowserWindow({
    width: winWidth,
    height: winHeight,
    x: sw - winWidth - 24,
    y: 64,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    hasShadow: true,
    resizable: true,
    minWidth: 280,
    minHeight: 360,
    alwaysOnTop: true,
    skipTaskbar: false,
    vibrancy: 'under-window',
    visualEffectState: 'active',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.setAlwaysOnTop(true, 'floating');
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5180');
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  const icon = nativeImage.createEmpty();
  tray = new Tray(icon);
  tray.setTitle('✓');
  const menu = Menu.buildFromTemplate([
    { label: 'Show JobDone', click: () => mainWindow && mainWindow.show() },
    { label: 'Hide JobDone', click: () => mainWindow && mainWindow.hide() },
    { type: 'separator' },
    {
      label: 'Toggle Always On Top',
      type: 'checkbox',
      checked: true,
      click: (item) => mainWindow && mainWindow.setAlwaysOnTop(item.checked, 'floating'),
    },
    { type: 'separator' },
    { label: 'Quit', role: 'quit' },
  ]);
  tray.setContextMenu(menu);
  tray.on('click', () => {
    if (!mainWindow) return;
    if (mainWindow.isVisible()) mainWindow.hide();
    else mainWindow.show();
  });
}

ipcMain.handle('store:read', () => readData());
ipcMain.handle('store:write', (_evt, data) => writeData(data));
ipcMain.handle('window:close', () => mainWindow && mainWindow.hide());
ipcMain.handle('window:minimize', () => mainWindow && mainWindow.minimize());
ipcMain.handle('window:set-always-on-top', (_evt, flag) => {
  if (mainWindow) mainWindow.setAlwaysOnTop(!!flag, 'floating');
  return !!flag;
});

app.whenReady().then(() => {
  createWindow();
  createTray();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
    else mainWindow && mainWindow.show();
  });
});

app.on('window-all-closed', () => {
  // Keep app alive in tray on macOS
  if (process.platform !== 'darwin') app.quit();
});
