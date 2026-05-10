import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  executeCommand: (command: string, params: Record<string, unknown>): Promise<string> => {
    return ipcRenderer.invoke('execute-command', command, params);
  },
  getSignedUrl: (): Promise<string> => {
    return ipcRenderer.invoke('get-signed-url');
  },
  onToggleConversation: (callback: () => void) => {
    ipcRenderer.on('toggle-conversation', callback);
    return () => {
      ipcRenderer.removeListener('toggle-conversation', callback);
    };
  },
  onThemeChanged: (callback: (theme: string) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, theme: string) => callback(theme);
    ipcRenderer.on('theme-changed', handler);
    return () => {
      ipcRenderer.removeListener('theme-changed', handler);
    };
  },
  getTheme: (): Promise<string> => {
    return ipcRenderer.invoke('get-theme');
  },
  getSettings: (): Promise<Record<string, unknown>> => {
    return ipcRenderer.invoke('get-settings');
  },
  saveSettings: (settings: Record<string, unknown>): Promise<Record<string, unknown>> => {
    return ipcRenderer.invoke('save-settings', settings);
  },
  getScreenInfo: (): Promise<Array<Record<string, unknown>>> => {
    return ipcRenderer.invoke('get-screen-info');
  },
  moveWindow: (x: number, y: number): Promise<void> => {
    return ipcRenderer.invoke('move-window', x, y);
  },
  getMicrophonePermission: (): Promise<string> => {
    return ipcRenderer.invoke('get-microphone-permission');
  },
});
