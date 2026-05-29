import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, shell } from 'electron';
import path from 'node:path';
import { WhatsAppEngine } from './whatsapp-engine';
import { ConfigStore, WAEngineConfig } from './config-store';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let waEngine: WhatsAppEngine | null = null;
let isQuitting = false;
const configStore = new ConfigStore();

const createWindow = () => {
  const config = configStore.get() as WAEngineConfig;
  const savedBounds = config.windowBounds;

  mainWindow = new BrowserWindow({
    width: savedBounds?.width || 1100,
    height: savedBounds?.height || 750,
    x: savedBounds?.x,
    y: savedBounds?.y,
    minWidth: 900,
    minHeight: 600,
    title: 'WA Engine - GreenPOS',
    backgroundColor: '#FDFBF7',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
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
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }
};

const saveBounds = () => {
  if (mainWindow && !mainWindow.isMinimized() && !mainWindow.isMaximized()) {
    const bounds = mainWindow.getBounds();
    configStore.set('windowBounds', bounds);
  }
};

const createTray = () => {
  const iconPath = app.isPackaged
    ? path.join(process.resourcesPath, 'icon.png')
    : path.join(__dirname, '../../public/icon.png');

  let icon: Electron.NativeImage;
  try {
    icon = nativeImage.createFromPath(iconPath);
    if (icon.isEmpty()) {
      icon = nativeImage.createEmpty();
    }
  } catch {
    icon = nativeImage.createEmpty();
  }

  tray = new Tray(icon.isEmpty() ? nativeImage.createFromDataURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAABpElEQVR4nO2WPWoDQRCGv0tMDGzQQhC0Mbiwt7Gxsbez8AeI2NhYWVpYWVpYWdpYWdpYWVsYGBkYWBikEOZC3rsLiCEx901m7zs5M8lkZr6deTOsKMKMx6DneT+bQwR4AM+BpX0sKQLYBt4BL9ueBPYDP8CjNqUI4DrQIbAIbALbwEtqHyUCWABugZdUvgocAldJk0oEsAhcq4wZMAqsAy/qq0sEsApcA0+qiwJ9YB+4D+1zYAR0gWN1WQSWVD83y5sE1oArYENV5gPAoMr6LLCqrrMC7KtXNgvsAvvAoaqcA0PVPqv+BJaBS+BBdZ8DQ9U5G0aBY+BeTXEK3AOXqs4JsAScA2fAPnAQ+hqYBk6AK+A+NOsUOAfOgCsg9FXgGDgHToFjtWcX2AJ2gCPgGLhSfX4IjAJ7wAFwCFyo8U+BCbX/RmV9D8yovQvAtNrrBDgFzoBBta8Dz6r8K4EJYBc4AI6Bo5RD7QfOgRPVeQuYRJs/AKaAbeAIuAqtbwIDa98isAi8hMaLwBywBuypftPAIrCi+t8FhlQ/D0yovRX1wAwwCayofk+BYdXPMjABrKr+j4BhYE31ewEMq/5TYBhYVv0fAsPAuur/GBgG1lT/x8AIAAAAAAAAAP4j/wJfCQm8kR2HvwAAAABJRU5ErkJggg==') : icon);

  const contextMenu = Menu.buildFromTemplate([
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
        app.quit();
      }
    },
  ]);

  tray.setToolTip('WA Engine - Offline');
  tray.setContextMenu(contextMenu);

  tray.on('double-click', () => {
    mainWindow?.show();
  });
};

const updateTrayMenu = (status: 'offline' | 'connecting' | 'connected' | 'error') => {
  if (!tray) return;

  const statusLabels = {
    offline: '● Offline',
    connecting: '⟳ Menghubungkan...',
    connected: '✓ Terhubung',
    error: '✗ Error'
  };

  const contextMenu = Menu.buildFromTemplate([
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
        app.quit();
      }
    },
  ]);

  tray.setToolTip(`WA Engine - ${status === 'connected' ? 'Terhubung' : status === 'connecting' ? 'Menghubungkan...' : status === 'error' ? 'Error' : 'Offline'}`);
  tray.setContextMenu(contextMenu);
};

// IPC Handlers
ipcMain.handle('get-config', () => configStore.get());

ipcMain.handle('set-config', (_event, config: Record<string, unknown>) => {
  Object.entries(config).forEach(([key, value]) => {
    configStore.set(key as keyof WAEngineConfig, value as any);
  });
  return configStore.get();
});

ipcMain.handle('start-whatsapp', async () => {
  try {
    const sessionPath = configStore.getSessionPath();
    waEngine = new WhatsAppEngine(sessionPath);

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
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    updateTrayMenu('error');
    mainWindow?.webContents.send('whatsapp-status', 'error');
    mainWindow?.webContents.send('whatsapp-error', message);
    return { success: false, error: message };
  }
});

ipcMain.handle('stop-whatsapp', async () => {
  try {
    if (waEngine) {
      await waEngine.stop();
      waEngine = null;
    }
    updateTrayMenu('offline');
    mainWindow?.webContents.send('whatsapp-status', 'offline');
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
});

ipcMain.handle('send-receipt', async (_event, { phone, message }: { phone: string; message: string }) => {
  if (!waEngine?.isConnected()) {
    return { success: false, error: 'WhatsApp belum terhubung' };
  }
  try {
    await waEngine.sendMessage(phone, message);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
});

ipcMain.handle('get-whatsapp-status', () => {
  if (!waEngine) return 'offline';
  return waEngine.isConnected() ? 'connected' : 'connecting';
});

ipcMain.handle('open-external', (_event, url: string) => {
  shell.openExternal(url);
});

// App lifecycle
app.on('ready', () => {
  createWindow();
  createTray();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // Don't quit on window close, stay in tray
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', async () => {
  isQuitting = true;
  if (waEngine) {
    await waEngine.stop();
  }
});