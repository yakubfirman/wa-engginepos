import { EventEmitter } from 'events';
import { useMultiFileAuthState, DisconnectReason, makeSocket, Socket } from '@adiwajshing/baileys';
import fs from 'fs';

const PQueue = require('p-queue');

export class WhatsAppServer extends EventEmitter {
  private sock: Socket | null = null;
  private _isConnected = false;
  private isClosing = false;
  private sendQueue: any;
  private sessionPath: string;

  constructor(sessionPath = './whatsapp-sessions') {
    super();
    this.sessionPath = sessionPath;
    this.sendQueue = new PQueue({ concurrency: 1, interval: 1000, intervalCap: 20 });
  }

  async start(): Promise<void> {
    if (this.sock) {
      throw new Error('WhatsApp sudah berjalan');
    }

    this.isClosing = false;
    this.log('Memulai WhatsApp Server...');

    try {
      // Ensure session directory exists
      if (!fs.existsSync(this.sessionPath)) {
        fs.mkdirSync(this.sessionPath, { recursive: true });
      }

      const { state, saveCreds } = await useMultiFileAuthState(this.sessionPath);

      this.sock = makeSocket({
        auth: state,
        printQRInTerminal: true, // Important for server mode
        browser: ['WA Engine Server', 'Ubuntu', '20.04'],
        version: [2, 3000, 1015906117],
      });

      this.sock.ev.on('connection.update', async (update: any) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          this.log('QR Code diterima');
          this.emit('qr', qr);
        }

        if (connection === 'open') {
          this._isConnected = true;
          this.log('WhatsApp terhubung!');
          this.emit('connected');
        }

        if (connection === 'close') {
          const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

          if (shouldReconnect && !this.isClosing) {
            this.log('Koneksi terputus - akan reconnect...');
            this.emit('disconnected');
            this.sock = null;
            setTimeout(() => this.start(), 3000);
          } else {
            this.log('WhatsApp keluar/logout');
            this._isConnected = false;
            this.emit('disconnected');
            this.sock = null;
          }
        }
      });

      this.sock.ev.on('creds.update', saveCreds);

      this.log('Menunggu QR Code... (check terminal untuk QR)');

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error tidak dikenal';
      this.log(`Error: ${message}`);
      this.emit('error', message);
      throw error;
    }
  }

  async stop(): Promise<void> {
    this.log('Menghentikan WhatsApp Server...');
    this.isClosing = true;

    if (this.sock) {
      try {
        this.sock.end(new Error('User stop'));
      } catch (e) {
        // Ignore
      }
      this.sock = null;
    }

    this._isConnected = false;
    this.log('WhatsApp Server dihentikan');
  }

  async sendMessage(phone: string, message: string): Promise<void> {
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
          } else if (!jid.startsWith('62')) {
            jid = '62' + jid;
          }
          jid = jid + '@s.whatsapp.net';
        }

        this.log(`Mengirim pesan ke ${phone}...`);
        await this.sock.sendMessage(jid, { text: message });
        this.log(`Pesan terkirim ke ${phone}`);
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : 'Gagal kirim pesan';
        this.log(`Gagal kirim: ${errMsg}`);
        throw error;
      }
    });
  }

  isConnected(): boolean {
    return this._isConnected;
  }

  isReady(): boolean {
    return this._isConnected && this.sock !== null;
  }

  private log(message: string): void {
    const timestamp = new Date().toLocaleTimeString('id-ID');
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    this.emit('logs', logMessage);
  }
}