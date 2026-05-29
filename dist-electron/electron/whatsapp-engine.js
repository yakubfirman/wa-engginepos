"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppEngine = void 0;
const events_1 = require("events");
const baileys_1 = require("@adiwajshing/baileys");
const node_fs_1 = __importDefault(require("node:fs"));
const PQueue = require('p-queue');
class WhatsAppEngine extends events_1.EventEmitter {
    constructor(sessionPath) {
        super();
        this.sock = null;
        this._isConnected = false;
        this.isClosing = false;
        this.sessionPath = sessionPath;
        this.sendQueue = new PQueue({ concurrency: 1, interval: 1000, intervalCap: 20 });
    }
    async start() {
        if (this.sock) {
            throw new Error('WhatsApp sudah berjalan');
        }
        this.isClosing = false;
        this.log('Memulai WhatsApp Engine...');
        try {
            // Ensure session folder exists
            if (!node_fs_1.default.existsSync(this.sessionPath)) {
                node_fs_1.default.mkdirSync(this.sessionPath, { recursive: true });
            }
            const { state, saveCreds } = await (0, baileys_1.useMultiFileAuthState)(this.sessionPath);
            this.sock = (0, baileys_1.makeSocket)({
                auth: state,
                printQRInTerminal: false,
                browser: ['WA Engine', 'Desktop', '3.0'],
                version: [2, 3000, 1015906117],
            });
            this.sock.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect, qr } = update;
                if (qr) {
                    this.log('QR Code diterima - harap scan dengan WhatsApp');
                    this.emit('qr', qr);
                }
                if (connection === 'open') {
                    this._isConnected = true;
                    this.log('WhatsApp terhubung!');
                    this.emit('connected');
                }
                if (connection === 'close') {
                    const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== baileys_1.DisconnectReason.loggedOut;
                    if (shouldReconnect && !this.isClosing) {
                        this.log('Koneksi terputus - akan reconnect...');
                        this.emit('disconnected');
                        this.sock = null;
                        setTimeout(() => this.start(), 3000);
                    }
                    else {
                        this.log('WhatsApp keluar/logout');
                        this._isConnected = false;
                        this.emit('disconnected');
                        this.sock = null;
                    }
                }
            });
            this.sock.ev.on('creds.update', saveCreds);
            this.sock.ev.on('messages.upsert', async (update) => {
                for (const message of update.messages) {
                    if (!message.key.fromMe) {
                        const jid = message.key.remoteJid;
                        if (jid) {
                            this.log(`Pesan masuk dari ${jid}`);
                        }
                    }
                }
            });
            this.log('Menunggu QR Code...');
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Error tidak dikenal';
            this.log(`Error: ${message}`);
            this.emit('error', message);
            throw error;
        }
    }
    async stop() {
        this.log('Menghentikan WhatsApp Engine...');
        this.isClosing = true;
        if (this.sock) {
            try {
                this.sock.end(new Error('User stop'));
            }
            catch (e) {
                // Ignore
            }
            this.sock = null;
        }
        this._isConnected = false;
        this.log('WhatsApp Engine dihentikan');
    }
    async sendMessage(phone, message) {
        if (!this.sock || !this._isConnected) {
            throw new Error('WhatsApp belum terhubung');
        }
        return this.sendQueue.add(async () => {
            try {
                // Format phone number
                let jid = phone.replace(/\D/g, '');
                // Add @s.whatsapp.net if not present
                if (!jid.includes('@s.whatsapp.net')) {
                    if (jid.startsWith('0')) {
                        jid = '62' + jid.substring(1);
                    }
                    else if (!jid.startsWith('62')) {
                        jid = '62' + jid;
                    }
                    jid = jid + '@s.whatsapp.net';
                }
                this.log(`Mengirim pesan ke ${phone}...`);
                await this.sock.sendMessage(jid, { text: message });
                this.log(`Pesan terkirim ke ${phone}`);
            }
            catch (error) {
                const errMsg = error instanceof Error ? error.message : 'Gagal kirim pesan';
                this.log(`Gagal kirim: ${errMsg}`);
                throw error;
            }
        });
    }
    isConnected() {
        return this._isConnected;
    }
    isReady() {
        return this._isConnected && this.sock !== null;
    }
    log(message) {
        const timestamp = new Date().toLocaleTimeString('id-ID');
        const logMessage = `[${timestamp}] ${message}`;
        console.log(logMessage);
        this.emit('logs', logMessage);
    }
}
exports.WhatsAppEngine = WhatsAppEngine;
