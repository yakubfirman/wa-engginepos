import { useState } from 'react';
import { Send, Phone, MessageSquare, Loader2, Check, AlertCircle } from 'lucide-react';

export function SendReceipt() {
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !message) return;

    setIsSending(true);
    setResult(null);

    try {
      const response = await window.electronAPI.sendReceipt({ phone, message });
      if (response.success) {
        setResult({ success: true, message: 'Pesan berhasil dikirim!' });
        setPhone('');
        setMessage('');
      } else {
        setResult({ success: false, message: response.error || 'Gagal mengirim pesan' });
      }
    } catch (error) {
      setResult({ success: false, message: 'Terjadi kesalahan saat mengirim' });
    } finally {
      setIsSending(false);
    }
  };

  const handleTestSend = async () => {
    const testPhone = '081234567890';
    const testMessage = '🧾 *Test WA Engine*\n\nPesan ini dikirim otomatis oleh WA Engine.\nGreenPOS Integration ✓';

    setIsSending(true);
    setResult(null);

    try {
      const response = await window.electronAPI.sendReceipt({ phone: testPhone, message: testMessage });
      if (response.success) {
        setResult({ success: true, message: 'Pesan test berhasil dikirim!' });
      } else {
        setResult({ success: false, message: response.error || 'Gagal mengirim pesan test' });
      }
    } catch (error) {
      setResult({ success: false, message: 'Terjadi kesalahan saat mengirim' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <Send className="h-5 w-5 text-primary-600" />
        <h3 className="text-sm font-semibold text-stone-800">Kirim Struk</h3>
      </div>

      <form onSubmit={handleSend} className="space-y-4">
        <div>
          <label className="label mb-1.5 block">Nomor WhatsApp</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="08xxxxxxxxxx"
              className="input-field pl-10"
            />
          </div>
          <p className="mt-1 text-xs text-stone-500">Contoh: 081234567890 atau 6281234567890</p>
        </div>

        <div>
          <label className="label mb-1.5 block">Pesan Struk</label>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Masukkan pesan struk..."
              rows={6}
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 pl-10 text-sm text-stone-800 placeholder:text-stone-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors resize-none"
            />
          </div>
          <p className="mt-1 text-xs text-stone-500">
            supports: *bold*, _italic_, ~strikethrough~, ```code```
          </p>
        </div>

        {result && (
          <div className={`rounded-lg p-3 ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center gap-2">
              {result.success ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <span className={`text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                {result.message}
              </span>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSending || !phone || !message}
            className="btn-primary flex-1"
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Mengirim...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Kirim Pesan
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleTestSend}
            disabled={isSending}
            className="btn-secondary"
          >
            Test
          </button>
        </div>
      </form>
    </div>
  );
}
