"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const whatsapp_server_1 = require("./whatsapp-server");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minute
    max: 20, // max 20 requests per minute
    message: { success: false, error: 'Terlalu banyak permintaan, coba lagi nanti.' }
});
app.use('/api/', limiter);
// Health check
app.get('/health', (req, res) => {
    res.json({
        status: waServer?.isConnected() ? 'connected' : 'offline',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});
// Initialize WhatsApp Server
let waServer;
// POST /api/qr - Get QR Code
app.post('/api/qr', async (req, res) => {
    try {
        if (!waServer) {
            waServer = new whatsapp_server_1.WhatsAppServer();
        }
        // If already connected, return connected status
        if (waServer.isConnected()) {
            return res.json({
                success: true,
                status: 'connected',
                message: 'WhatsApp sudah terhubung'
            });
        }
        // Start WhatsApp connection
        waServer.on('qr', (qr) => {
            res.json({ success: true, status: 'qr', qr });
        });
        waServer.on('connected', () => {
            console.log('[Express] WhatsApp connected');
        });
        waServer.on('error', (error) => {
            console.error('[Express] WhatsApp error:', error);
        });
        await waServer.start();
        res.json({
            success: true,
            status: 'connecting',
            message: 'Memulai koneksi WhatsApp...'
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, error: message });
    }
});
// GET /api/status - Get WhatsApp status
app.get('/api/status', (req, res) => {
    res.json({
        success: true,
        status: waServer?.isConnected() ? 'connected' : 'offline'
    });
});
// POST /api/send - Send WhatsApp message
app.post('/api/send', async (req, res) => {
    try {
        const { phone, message } = req.body;
        if (!phone || !message) {
            return res.status(400).json({
                success: false,
                error: 'Phone dan message diperlukan'
            });
        }
        if (!waServer?.isConnected()) {
            return res.status(503).json({
                success: false,
                error: 'WhatsApp belum terhubung'
            });
        }
        await waServer.sendMessage(phone, message);
        res.json({
            success: true,
            message: 'Pesan berhasil dikirim'
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, error: message });
    }
});
// POST /api/receipt - Send receipt from GreenPOS
app.post('/api/receipt', async (req, res) => {
    try {
        const { phone, invoice_number, items, subtotal, discount_amount, tax_amount, total, payment_method, amount_paid, change_amount, cashier_name, api_key } = req.body;
        // Validate API key if provided in config
        // const config = getConfig();
        // if (config.greenposApiKey && api_key !== config.greenposApiKey) {
        //   return res.status(401).json({ success: false, error: 'API Key tidak valid' });
        // }
        if (!phone) {
            return res.status(400).json({
                success: false,
                error: 'Nomor telepon diperlukan'
            });
        }
        if (!waServer?.isConnected()) {
            return res.status(503).json({
                success: false,
                error: 'WhatsApp belum terhubung'
            });
        }
        // Format receipt message
        const message = formatReceiptMessage({
            invoice_number: invoice_number || 'N/A',
            items: items || [],
            subtotal: subtotal || 0,
            discount_amount: discount_amount || 0,
            tax_amount: tax_amount || 0,
            total: total || 0,
            payment_method: payment_method || 'cash',
            amount_paid: amount_paid || 0,
            change_amount: change_amount || 0,
            cashier_name: cashier_name || 'Kasir',
            timestamp: new Date().toISOString()
        });
        await waServer.sendMessage(phone, message);
        res.json({
            success: true,
            message: 'Struk berhasil dikirim via WhatsApp'
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, error: message });
    }
});
// POST /api/disconnect - Disconnect WhatsApp
app.post('/api/disconnect', async (req, res) => {
    try {
        if (waServer) {
            await waServer.stop();
        }
        res.json({ success: true, message: 'WhatsApp disconnected' });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, error: message });
    }
});
// Helper function to format receipt
function formatReceiptMessage(data) {
    const lines = [
        '🧾 *STRUK PEMBELIAN*',
        '━━━━━━━━━━━━━━━━━━━━━',
        `📋 Invoice: ${data.invoice_number}`,
        `📅 ${new Date(data.timestamp).toLocaleString('id-ID')}`,
        `👤 Kasir: ${data.cashier_name}`,
        '',
        '*Item:*',
        ...data.items.map(item => `• ${item.name} x${item.quantity} = Rp ${item.subtotal.toLocaleString('id-ID')}`),
        '',
        `Subtotal: Rp ${data.subtotal.toLocaleString('id-ID')}`,
        data.discount_amount > 0 ? `Diskon: -Rp ${data.discount_amount.toLocaleString('id-ID')}` : null,
        data.tax_amount > 0 ? `Pajak: Rp ${data.tax_amount.toLocaleString('id-ID')}` : null,
        '',
        `💰 *TOTAL: Rp ${data.total.toLocaleString('id-ID')}*`,
        '',
        `Bayar (${data.payment_method}): Rp ${data.amount_paid.toLocaleString('id-ID')}`,
        `Kembalian: Rp ${data.change_amount.toLocaleString('id-ID')}`,
        '',
        '━━━━━━━━━━━━━━━━━━━━━',
        '*Terima kasih atas pembelian Anda!*',
        '',
        '_GreenPOS Integration_'
    ].filter(Boolean);
    return lines.join('\n');
}
// Error handler
app.use((err, req, res, next) => {
    console.error('[Express Error]', err);
    res.status(500).json({ success: false, error: err.message });
});
// Start server
app.listen(Number(PORT), HOST, () => {
    console.log(`
╔═══════════════════════════════════════════════════╗
║        WA Engine Server - Express                 ║
╠═══════════════════════════════════════════════════╣
║  Status  : Starting...                           ║
║  Host    : ${HOST.padEnd(42)}║
║  Port    : ${String(PORT).padEnd(42)}║
║                                                   ║
║  Endpoints:                                       ║
║  • GET  /health        - Health check             ║
║  • POST /api/qr        - Start WhatsApp           ║
║  • GET  /api/status    - Get connection status    ║
║  • POST /api/send      - Send message            ║
║  • POST /api/receipt   - Send formatted receipt  ║
║  • POST /api/disconnect - Disconnect             ║
╚═══════════════════════════════════════════════════╝
  `);
});
// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('[Express] SIGTERM received, shutting down...');
    if (waServer) {
        await waServer.stop();
    }
    process.exit(0);
});
process.on('SIGINT', async () => {
    console.log('[Express] SIGINT received, shutting down...');
    if (waServer) {
        await waServer.stop();
    }
    process.exit(0);
});
