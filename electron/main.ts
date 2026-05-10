import {
  app, BrowserWindow, ipcMain, screen, Tray, Menu,
  nativeImage, globalShortcut, nativeTheme, systemPreferences,
} from 'electron';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { handleCommand } from './system/index';
import { loadSettings, saveSettings } from './store';
import { setupAutoUpdater } from './updater';

dotenv.config({ path: path.join(app.getAppPath(), '.env') });

app.commandLine.appendSwitch('disable-features', 'AsyncDns');

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

function createWindow() {
  const settings = loadSettings();
  const { width: screenWidth } = screen.getPrimaryDisplay().workAreaSize;

  const x = settings.windowX ?? screenWidth - 340;
  const y = settings.windowY ?? 40;

  mainWindow = new BrowserWindow({
    width: 300,
    height: 540,
    x,
    y,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    hasShadow: false,
    resizable: false,
    skipTaskbar: true,
    movable: true,
    show: false,
    vibrancy: undefined,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  mainWindow.setAlwaysOnTop(true, 'screen-saver', 1);

  if (process.env.NODE_ENV === 'development' || process.argv.includes('--dev')) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    mainWindow?.webContents.send('theme-changed', nativeTheme.shouldUseDarkColors ? 'dark' : 'light');

    if (process.env.NODE_ENV !== 'development' && !process.argv.includes('--dev')) {
      setupAutoUpdater(mainWindow!);
    }
  });

  mainWindow.on('moved', () => {
    if (!mainWindow) return;
    const [wx, wy] = mainWindow.getPosition();
    saveSettings({ windowX: wx, windowY: wy });
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  const icon = nativeImage.createFromDataURL(
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA4ElEQVQ4T6WTyw3CQAxE/ycgOqAEOqADSqEDOqAEOqCDdAAl0AFUQBIlI61WK5IFLqfxeN7Y44j/fqK6/woQcQrgGMAegJeI3Loam4CI7AC4AvBk5ruvBSLOANwD2DLz1Qci4gTADYC9iDzaSERsATgDsFDVo6+JiCWAGwBrVT34WjuNFYB7Zl6FPBGxAHAHYKOqmxDQ+r4CsMzMq3BeRNwC2InIOoQR0QC4YealiKxDg3b3HMBGVQ/9AURM2wUzL0WkfaH3+gnAg5nnYeL2vP8KkJkfXfk/Ab4AhPBJEfhMdRkAAAAASUVORK5CYII='
  );
  icon.setTemplateImage(true);

  tray = new Tray(icon);
  tray.setToolTip('Aura');

  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
      }
    }
  });

  tray.on('right-click', () => {
    const contextMenu = Menu.buildFromTemplate([
      { label: 'Show/Hide Aura', click: () => mainWindow?.isVisible() ? mainWindow.hide() : mainWindow?.show() },
      { type: 'separator' },
      { label: 'Quit', click: () => app.quit() },
    ]);
    tray?.popUpContextMenu(contextMenu);
  });
}

function registerGlobalShortcuts() {
  globalShortcut.register('CommandOrControl+Shift+A', () => {
    if (!mainWindow) return;

    if (!mainWindow.isVisible()) {
      mainWindow.show();
    }

    mainWindow.webContents.send('toggle-conversation');
  });
}

function watchThemeChanges() {
  nativeTheme.on('updated', () => {
    const theme = nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
    mainWindow?.webContents.send('theme-changed', theme);
  });
}

app.whenReady().then(() => {
  createTray();
  createWindow();
  registerGlobalShortcuts();
  watchThemeChanges();

  ipcMain.handle('execute-command', async (_event, command: string, params: Record<string, unknown>) => {
    try {
      const result = await handleCommand(command, params);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return `Error: ${message}`;
    }
  });

  ipcMain.handle('get-signed-url', async () => {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const agentId = process.env.VITE_ELEVENLABS_AGENT_ID;
    if (!apiKey || !agentId) {
      throw new Error('Missing ELEVENLABS_API_KEY or VITE_ELEVENLABS_AGENT_ID');
    }
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${agentId}`,
      { headers: { 'xi-api-key': apiKey } }
    );
    if (!response.ok) {
      throw new Error(`Failed to get signed URL: ${response.status}`);
    }
    const data = await response.json();
    return data.signed_url;
  });

  ipcMain.handle('get-settings', () => {
    return loadSettings();
  });

  ipcMain.handle('save-settings', (_event, settings: Record<string, unknown>) => {
    return saveSettings(settings);
  });

  ipcMain.handle('get-theme', () => {
    return nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
  });

  ipcMain.handle('get-screen-info', () => {
    const displays = screen.getAllDisplays();
    return displays.map((d) => ({
      id: d.id,
      bounds: d.bounds,
      workArea: d.workAreaSize,
      scaleFactor: d.scaleFactor,
    }));
  });

  ipcMain.handle('move-window', (_event, x: number, y: number) => {
    if (mainWindow) {
      mainWindow.setPosition(Math.round(x), Math.round(y));
      saveSettings({ windowX: Math.round(x), windowY: Math.round(y) });
    }
  });

  ipcMain.handle('get-microphone-permission', async () => {
    const status = systemPreferences.getMediaAccessStatus('microphone');
    if (status !== 'granted') {
      const granted = await systemPreferences.askForMediaAccess('microphone');
      return granted ? 'granted' : 'denied';
    }
    return 'granted';
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
