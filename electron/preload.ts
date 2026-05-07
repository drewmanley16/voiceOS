import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  executeCommand: (command: string, params: Record<string, unknown>): Promise<string> => {
    return ipcRenderer.invoke('execute-command', command, params);
  },
});
