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
    // Atomic write: write to temp file then rename so a crash mid-write
    // can't truncate the existing data file.
    const tmp = `${dataFile}.tmp-${process.pid}`;
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tmp, dataFile);
    return true;
  } catch (err) {
    console.error('writeData error', err);
    return false;
  }
}

// Take a snapshot copy of jobdone.json on launch as a defensive backup
// across version updates. Skip if the most recent snapshot is < 24h old,
// and prune to keep at most 10 snapshots total.
function snapshotOnLaunch() {
  try {
    if (!fs.existsSync(dataFile)) return;
    const all = fs.readdirSync(userDataDir).filter(
      (n) => n.startsWith('jobdone.snapshot-') && n.endsWith('.json')
    ).sort();

    const newest = all[all.length - 1];
    if (newest) {
      const newestPath = path.join(userDataDir, newest);
      const stat = fs.statSync(newestPath);
      if (Date.now() - stat.mtimeMs < 24 * 60 * 60 * 1000) return;
    }

    const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    fs.copyFileSync(dataFile, path.join(userDataDir, `jobdone.snapshot-${stamp}.json`));

    const after = fs.readdirSync(userDataDir).filter(
      (n) => n.startsWith('jobdone.snapshot-') && n.endsWith('.json')
    ).sort();
    while (after.length > 10) {
      const old = after.shift();
      try { fs.unlinkSync(path.join(userDataDir, old)); } catch {}
    }
  } catch (err) {
    console.error('snapshotOnLaunch error', err);
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
  snapshotOnLaunch();
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
