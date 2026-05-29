"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigStore = void 0;
const electron_store_1 = __importDefault(require("electron-store"));
const node_path_1 = __importDefault(require("node:path"));
const electron_1 = require("electron");
const defaults = {
    serverPort: 3001,
    serverHost: '0.0.0.0',
    autoStart: false,
    greenposUrl: 'http://localhost:8000',
    greenposApiKey: '',
    deviceName: 'WA Engine',
    sessionPath: 'whatsapp-sessions',
};
class ConfigStore {
    constructor() {
        const userDataPath = electron_1.app.getPath('userData');
        this.store = new electron_store_1.default({
            name: 'wa-engine-config',
            defaults,
            cwd: userDataPath,
        });
    }
    get(key) {
        if (key) {
            return this.store.get(key);
        }
        return this.store.store;
    }
    set(key, value) {
        this.store.set(key, value);
    }
    reset() {
        this.store.clear();
    }
    getSessionPath() {
        const userDataPath = electron_1.app.getPath('userData');
        const sessionPath = this.store.get('sessionPath') || 'whatsapp-sessions';
        return node_path_1.default.join(userDataPath, sessionPath);
    }
}
exports.ConfigStore = ConfigStore;
