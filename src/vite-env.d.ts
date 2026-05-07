/// <reference types="vite/client" />

interface ElectronAPI {
  executeCommand: (command: string, params: Record<string, unknown>) => Promise<string>;
}

interface Window {
  electronAPI: ElectronAPI;
}
