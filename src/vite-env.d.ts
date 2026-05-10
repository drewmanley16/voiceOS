/// <reference types="vite/client" />

interface ElectronAPI {
  executeCommand: (command: string, params: Record<string, unknown>) => Promise<string>;
  getSignedUrl: () => Promise<string>;
  onToggleConversation: (callback: () => void) => () => void;
  onThemeChanged: (callback: (theme: string) => void) => () => void;
  getTheme: () => Promise<string>;
  getSettings: () => Promise<Record<string, unknown>>;
  saveSettings: (settings: Record<string, unknown>) => Promise<Record<string, unknown>>;
  getScreenInfo: () => Promise<Array<Record<string, unknown>>>;
  moveWindow: (x: number, y: number) => Promise<void>;
  getMicrophonePermission: () => Promise<string>;
}

interface Window {
  electronAPI: ElectronAPI;
}
