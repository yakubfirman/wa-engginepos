// API helper untuk komunikasi dengan GreenPOS
// Untuk saat ini, WhatsApp engine berjalan di Electron
// tetapi struktur ini siap untuk di-deploy ke Express server

export interface ReceiptData {
  invoice_number: string;
  customer_phone?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total: number;
  payment_method: 'cash' | 'qris' | 'transfer' | 'kartu';
  amount_paid: number;
  change_amount: number;
  cashier_name: string;
  timestamp: string;
}

export function formatReceiptMessage(data: ReceiptData): string {
  const lines = [
    '🧾 *STRUK PEMBELIAN*',
    '━━━━━━━━━━━━━━━━',
    `📋 Invoice: ${data.invoice_number}`,
    `📅 Tanggal: ${new Date(data.timestamp).toLocaleString('id-ID')}`,
    `👤 Kasir: ${data.cashier_name}`,
    '',
    '*Item:*',
    ...data.items.map(item =>
      `• ${item.name}`
    ),
    '',
    `Subtotal: Rp ${data.subtotal.toLocaleString('id-ID')}`,
    data.discount_amount > 0 ? `Diskon: Rp ${data.discount_amount.toLocaleString('id-ID')}` : null,
    data.tax_amount > 0 ? `Pajak: Rp ${data.tax_amount.toLocaleString('id-ID')}` : null,
    '',
    `💰 *Total: Rp ${data.total.toLocaleString('id-ID')}*`,
    '',
    `Bayar (${data.payment_method}): Rp ${data.amount_paid.toLocaleString('id-ID')}`,
    `Kembalian: Rp ${data.change_amount.toLocaleString('id-ID')}`,
    '',
    '━━━━━━━━━━━━━━━━',
    '*Terima kasih atas pembelian Anda!*',
    '',
    '_Dicastore - GreenPOS_',
  ].filter(Boolean);

  return lines.join('\n');
}

export function formatPhoneNumber(phone: string): string {
  // Hapus semua karakter non-digit
  let cleaned = phone.replace(/\D/g, '');

  // Jika dimulai dengan 0, ganti dengan 62
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  }

  // Pastikan dimulai dengan 62
  if (!cleaned.startsWith('62')) {
    cleaned = '62' + cleaned;
  }

  return cleaned;
}