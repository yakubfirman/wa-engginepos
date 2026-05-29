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

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
