import { autoUpdater } from 'electron-updater';
import { BrowserWindow } from 'electron';

export function setupAutoUpdater(window: BrowserWindow) {
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('checking-for-update', () => {
    console.log('[Aura Updater] Checking for updates...');
  });

  autoUpdater.on('update-available', (info) => {
    console.log('[Aura Updater] Update available:', info.version);
    window.webContents.send('update-status', { status: 'available', version: info.version });
  });

  autoUpdater.on('update-not-available', () => {
    console.log('[Aura Updater] App is up to date');
  });

  autoUpdater.on('download-progress', (progress) => {
    window.webContents.send('update-status', {
      status: 'downloading',
      percent: Math.round(progress.percent),
    });
  });

  autoUpdater.on('update-downloaded', (info) => {
    console.log('[Aura Updater] Update downloaded:', info.version);
    window.webContents.send('update-status', { status: 'ready', version: info.version });
  });

  autoUpdater.on('error', (err) => {
    console.error('[Aura Updater] Error:', err.message);
  });

  autoUpdater.checkForUpdatesAndNotify().catch((err) => {
    console.log('[Aura Updater] Update check skipped:', err.message);
  });
}
