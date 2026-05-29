"use strict";
const electron = require("electron");
const electronAPI = {
  getConfig: () => electron.ipcRenderer.invoke("get-config"),
  setConfig: (config) => electron.ipcRenderer.invoke("set-config", config),
  startWhatsApp: () => electron.ipcRenderer.invoke("start-whatsapp"),
  stopWhatsApp: () => electron.ipcRenderer.invoke("stop-whatsapp"),
  sendReceipt: (data) => electron.ipcRenderer.invoke("send-receipt", data),
  getWhatsAppStatus: () => electron.ipcRenderer.invoke("get-whatsapp-status"),
  openExternal: (url) => electron.ipcRenderer.invoke("open-external", url),
  onWhatsAppQR: (callback) => {
    const handler = (_event, qr) => callback(qr);
    electron.ipcRenderer.on("whatsapp-qr", handler);
    return () => electron.ipcRenderer.removeListener("whatsapp-qr", handler);
  },
  onWhatsAppStatus: (callback) => {
    const handler = (_event, status) => callback(status);
    electron.ipcRenderer.on("whatsapp-status", handler);
    return () => electron.ipcRenderer.removeListener("whatsapp-status", handler);
  },
  onWhatsAppError: (callback) => {
    const handler = (_event, error) => callback(error);
    electron.ipcRenderer.on("whatsapp-error", handler);
    return () => electron.ipcRenderer.removeListener("whatsapp-error", handler);
  },
  onWhatsAppLogs: (callback) => {
    const handler = (_event, log) => callback(log);
    electron.ipcRenderer.on("whatsapp-logs", handler);
    return () => electron.ipcRenderer.removeListener("whatsapp-logs", handler);
  }
};
electron.contextBridge.exposeInMainWorld("electronAPI", electronAPI);
