import Store from 'electron-store';
import path from 'node:path';
import { app } from 'electron';

export interface WAEngineConfig {
  serverPort: number;
  serverHost: string;
  autoStart: boolean;
  greenposUrl: string;
  greenposApiKey: string;
  deviceName: string;
  windowBounds?: {
    width: number;
    height: number;
    x: number;
    y: number;
  };
  sessionPath?: string;
}

const defaults: WAEngineConfig = {
  serverPort: 3001,
  serverHost: '0.0.0.0',
  autoStart: false,
  greenposUrl: 'http://localhost:8000',
  greenposApiKey: '',
  deviceName: 'WA Engine',
  sessionPath: 'whatsapp-sessions',
};

export class ConfigStore {
  private store: Store<WAEngineConfig>;

  constructor() {
    const userDataPath = app.getPath('userData');
    this.store = new Store<WAEngineConfig>({
      name: 'wa-engine-config',
      defaults,
      cwd: userDataPath,
    });
  }

  get<K extends keyof WAEngineConfig>(key?: K): WAEngineConfig | WAEngineConfig[K] {
    if (key) {
      return this.store.get(key) as WAEngineConfig[K];
    }
    return this.store.store;
  }

  set<K extends keyof WAEngineConfig>(key: K, value: WAEngineConfig[K]): void {
    this.store.set(key, value);
  }

  reset(): void {
    this.store.clear();
  }

  getSessionPath(): string {
    const userDataPath = app.getPath('userData');
    const sessionPath = this.store.get('sessionPath') || 'whatsapp-sessions';
    return path.join(userDataPath, sessionPath);
  }
}