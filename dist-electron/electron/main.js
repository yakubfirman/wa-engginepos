"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const node_path_1 = __importDefault(require("node:path"));
const whatsapp_engine_1 = require("./whatsapp-engine");
const config_store_1 = require("./config-store");
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    electron_1.app.quit();
}
let mainWindow = null;
let tray = null;
let waEngine = null;
let isQuitting = false;
const configStore = new config_store_1.ConfigStore();
const createWindow = () => {
    const config = configStore.get();
    const savedBounds = config.windowBounds;
    mainWindow = new electron_1.BrowserWindow({
        width: savedBounds?.width || 1100,
        height: savedBounds?.height || 750,
        x: savedBounds?.x,
        y: savedBounds?.y,
        minWidth: 900,
        minHeight: 600,
        title: 'WA Engine - GreenPOS',
        backgroundColor: '#FDFBF7',
        webPreferences: {
            preload: node_path_1.default.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
        show: false,
    });
    mainWindow.once('ready-to-show', () => {
        mainWindow?.show();
    });
    mainWindow.on('close', (event) => {
        if (!isQuitting) {
            event.preventDefault();
            mainWindow?.hide();
        }
    });
    mainWindow.on('resize', () => saveBounds());
    mainWindow.on('move', () => saveBounds());
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    }
    else {
        mainWindow.loadFile(node_path_1.default.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
    }
};
const saveBounds = () => {
    if (mainWindow && !mainWindow.isMinimized() && !mainWindow.isMaximized()) {
        const bounds = mainWindow.getBounds();
        configStore.set('windowBounds', bounds);
    }
};
const createTray = () => {
    const iconPath = electron_1.app.isPackaged
        ? node_path_1.default.join(process.resourcesPath, 'icon.png')
        : node_path_1.default.join(__dirname, '../../public/icon.png');
    let icon;
    try {
        icon = electron_1.nativeImage.createFromPath(iconPath);
        if (icon.isEmpty()) {
            icon = electron_1.nativeImage.createEmpty();
        }
    }
    catch {
        icon = electron_1.nativeImage.createEmpty();
    }
    tray = new electron_1.Tray(icon.isEmpty() ? electron_1.nativeImage.createFromDataURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAABpElEQVR4nO2WPWoDQRCGv0tMDGzQQhC0Mbiwt7Gxsbez8AeI2NhYWVpYWVpYWdpYWdpYWVsYGBkYWBikEOZC3rsLiCEx901m7zs5M8lkZr6deTOsKMKMx6DneT+bQwR4AM+BpX0sKQLYBt4BL9ueBPYDP8CjNqUI4DrQIbAIbALbwEtqHyUCWABugZdUvgocAldJk0oEsAhcq4wZMAqsAy/qq0sEsApcA0+qiwJ9YB+4D+1zYAR0gWN1WQSWVD83y5sE1oArYENV5gPAoMr6LLCqrrMC7KtXNgvsAvvAoaqcA0PVPqv+BJaBS+BBdZ8DQ9U5G0aBY+BeTXEK3AOXqs4JsAScA2fAPnAQ+hqYBk6AK+A+NOsUOAfOgCsg9FXgGDgHToFjtWcX2AJ2gCPgGLhSfX4IjAJ7wAFwCFyo8U+BCbX/RmV9D8yovQvAtNrrBDgFzoBBta8Dz6r8K4EJYBc4AI6Bo5RD7QfOgRPVeQuYRJs/AKaAbeAIuAqtbwIDa98isAi8hMaLwBywBuypftPAIrCi+t8FhlQ/D0yovRX1wAwwCayofk+BYdXPMjABrKr+j4BhYE31ewEMq/5TYBhYVv0fAsPAuur/GBgG1lT/x8AIAAAAAAAAAP4j/wJfCQm8kR2HvwAAAABJRU5ErkJggg==') : icon);
    const contextMenu = electron_1.Menu.buildFromTemplate([
        {
            label: 'Buka WA Engine',
            click: () => mainWindow?.show()
        },
        {
            label: 'Status:',
            enabled: false
        },
        {
            label: '● Offline',
            id: 'status-item',
            enabled: false
        },
        { type: 'separator' },
        {
            label: 'Keluar',
            click: () => {
                isQuitting = true;
                electron_1.app.quit();
            }
        },
    ]);
    tray.setToolTip('WA Engine - Offline');
    tray.setContextMenu(contextMenu);
    tray.on('double-click', () => {
        mainWindow?.show();
    });
};
const updateTrayMenu = (status) => {
    if (!tray)
        return;
    const statusLabels = {
        offline: '● Offline',
        connecting: '⟳ Menghubungkan...',
        connected: '✓ Terhubung',
        error: '✗ Error'
    };
    const contextMenu = electron_1.Menu.buildFromTemplate([
        {
            label: 'Buka WA Engine',
            click: () => mainWindow?.show()
        },
        {
            label: 'Status:',
            enabled: false
        },
        {
            label: statusLabels[status],
            id: 'status-item',
            enabled: false
        },
        { type: 'separator' },
        {
            label: 'Keluar',
            click: () => {
                isQuitting = true;
                electron_1.app.quit();
            }
        },
    ]);
    tray.setToolTip(`WA Engine - ${status === 'connected' ? 'Terhubung' : status === 'connecting' ? 'Menghubungkan...' : status === 'error' ? 'Error' : 'Offline'}`);
    tray.setContextMenu(contextMenu);
};
// IPC Handlers
electron_1.ipcMain.handle('get-config', () => configStore.get());
electron_1.ipcMain.handle('set-config', (_event, config) => {
    Object.entries(config).forEach(([key, value]) => {
        configStore.set(key, value);
    });
    return configStore.get();
});
electron_1.ipcMain.handle('start-whatsapp', async () => {
    try {
        const sessionPath = configStore.getSessionPath();
        waEngine = new whatsapp_engine_1.WhatsAppEngine(sessionPath);
        waEngine.on('qr', (qr) => {
            mainWindow?.webContents.send('whatsapp-qr', qr);
        });
        waEngine.on('connected', () => {
            mainWindow?.webContents.send('whatsapp-status', 'connected');
            updateTrayMenu('connected');
        });
        waEngine.on('disconnected', () => {
            mainWindow?.webContents.send('whatsapp-status', 'offline');
            updateTrayMenu('offline');
        });
        waEngine.on('error', (error) => {
            mainWindow?.webContents.send('whatsapp-error', error);
            updateTrayMenu('error');
        });
        waEngine.on('logs', (log) => {
            mainWindow?.webContents.send('whatsapp-logs', log);
        });
        updateTrayMenu('connecting');
        mainWindow?.webContents.send('whatsapp-status', 'connecting');
        await waEngine.start();
        return { success: true };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        updateTrayMenu('error');
        mainWindow?.webContents.send('whatsapp-status', 'error');
        mainWindow?.webContents.send('whatsapp-error', message);
        return { success: false, error: message };
    }
});
electron_1.ipcMain.handle('stop-whatsapp', async () => {
    try {
        if (waEngine) {
            await waEngine.stop();
            waEngine = null;
        }
        updateTrayMenu('offline');
        mainWindow?.webContents.send('whatsapp-status', 'offline');
        return { success: true };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: message };
    }
});
electron_1.ipcMain.handle('send-receipt', async (_event, { phone, message }) => {
    if (!waEngine?.isConnected()) {
        return { success: false, error: 'WhatsApp belum terhubung' };
    }
    try {
        await waEngine.sendMessage(phone, message);
        return { success: true };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: message };
    }
});
electron_1.ipcMain.handle('get-whatsapp-status', () => {
    if (!waEngine)
        return 'offline';
    return waEngine.isConnected() ? 'connected' : 'connecting';
});
electron_1.ipcMain.handle('open-external', (_event, url) => {
    electron_1.shell.openExternal(url);
});
// App lifecycle
electron_1.app.on('ready', () => {
    createWindow();
    createTray();
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        // Don't quit on window close, stay in tray
    }
});
electron_1.app.on('activate', () => {
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
electron_1.app.on('before-quit', async () => {
    isQuitting = true;
    if (waEngine) {
        await waEngine.stop();
    }
});
