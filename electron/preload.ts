import { contextBridge, ipcRenderer } from 'electron';

export interface ElectronAPI {
  getConfig: () => Promise<Record<string, unknown>>;
  setConfig: (config: Record<string, unknown>) => Promise<Record<string, unknown>>;
  startWhatsApp: () => Promise<{ success: boolean; error?: string }>;
  stopWhatsApp: () => Promise<{ success: boolean; error?: string }>;
  sendReceipt: (data: { phone: string; message: string }) => Promise<{ success: boolean; error?: string }>;
  getWhatsAppStatus: () => Promise<string>;
  openExternal: (url: string) => Promise<void>;
  onWhatsAppQR: (callback: (qr: string) => void) => () => void;
  onWhatsAppStatus: (callback: (status: string) => void) => () => void;
  onWhatsAppError: (callback: (error: string) => void) => () => void;
  onWhatsAppLogs: (callback: (log: string) => void) => () => void;
}

const electronAPI: ElectronAPI = {
  getConfig: () => ipcRenderer.invoke('get-config'),
  setConfig: (config: Record<string, unknown>) => ipcRenderer.invoke('set-config', config),
  startWhatsApp: () => ipcRenderer.invoke('start-whatsapp'),
  stopWhatsApp: () => ipcRenderer.invoke('stop-whatsapp'),
  sendReceipt: (data) => ipcRenderer.invoke('send-receipt', data),
  getWhatsAppStatus: () => ipcRenderer.invoke('get-whatsapp-status'),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  onWhatsAppQR: (callback) => {
    const handler = (_event: Electron.IpcRendererEvent, qr: string) => callback(qr);
    ipcRenderer.on('whatsapp-qr', handler);
    return () => ipcRenderer.removeListener('whatsapp-qr', handler);
  },
  onWhatsAppStatus: (callback) => {
    const handler = (_event: Electron.IpcRendererEvent, status: string) => callback(status);
    ipcRenderer.on('whatsapp-status', handler);
    return () => ipcRenderer.removeListener('whatsapp-status', handler);
  },
  onWhatsAppError: (callback) => {
    const handler = (_event: Electron.IpcRendererEvent, error: string) => callback(error);
    ipcRenderer.on('whatsapp-error', handler);
    return () => ipcRenderer.removeListener('whatsapp-error', handler);
  },
  onWhatsAppLogs: (callback) => {
    const handler = (_event: Electron.IpcRendererEvent, log: string) => callback(log);
    ipcRenderer.on('whatsapp-logs', handler);
    return () => ipcRenderer.removeListener('whatsapp-logs', handler);
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
