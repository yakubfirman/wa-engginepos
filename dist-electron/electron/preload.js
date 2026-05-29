"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const electronAPI = {
    getConfig: () => electron_1.ipcRenderer.invoke('get-config'),
    setConfig: (config) => electron_1.ipcRenderer.invoke('set-config', config),
    startWhatsApp: () => electron_1.ipcRenderer.invoke('start-whatsapp'),
    stopWhatsApp: () => electron_1.ipcRenderer.invoke('stop-whatsapp'),
    sendReceipt: (data) => electron_1.ipcRenderer.invoke('send-receipt', data),
    getWhatsAppStatus: () => electron_1.ipcRenderer.invoke('get-whatsapp-status'),
    openExternal: (url) => electron_1.ipcRenderer.invoke('open-external', url),
    onWhatsAppQR: (callback) => {
        const handler = (_event, qr) => callback(qr);
        electron_1.ipcRenderer.on('whatsapp-qr', handler);
        return () => electron_1.ipcRenderer.removeListener('whatsapp-qr', handler);
    },
    onWhatsAppStatus: (callback) => {
        const handler = (_event, status) => callback(status);
        electron_1.ipcRenderer.on('whatsapp-status', handler);
        return () => electron_1.ipcRenderer.removeListener('whatsapp-status', handler);
    },
    onWhatsAppError: (callback) => {
        const handler = (_event, error) => callback(error);
        electron_1.ipcRenderer.on('whatsapp-error', handler);
        return () => electron_1.ipcRenderer.removeListener('whatsapp-error', handler);
    },
    onWhatsAppLogs: (callback) => {
        const handler = (_event, log) => callback(log);
        electron_1.ipcRenderer.on('whatsapp-logs', handler);
        return () => electron_1.ipcRenderer.removeListener('whatsapp-logs', handler);
    },
};
electron_1.contextBridge.exposeInMainWorld('electronAPI', electronAPI);
