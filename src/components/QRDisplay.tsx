import { useState } from 'react';
import { QrCode, Smartphone, Loader2, Check } from 'lucide-react';

interface QRDisplayProps {
  qrCode: string | null;
  isWaiting: boolean;
}

export function QRDisplay({ qrCode, isWaiting }: QRDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (qrCode) {
      navigator.clipboard.writeText(qrCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <Smartphone className="h-5 w-5 text-primary-600" />
        <h3 className="text-sm font-semibold text-stone-800">Scan QR Code</h3>
      </div>

      {isWaiting && !qrCode && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 text-primary-600 animate-spin mb-4" />
          <p className="text-sm text-stone-500">Menunggu QR Code...</p>
          <p className="text-xs text-stone-400 mt-2">Pastikan WhatsApp di HP aktif</p>
        </div>
      )}

      {qrCode && (
        <div className="flex flex-col items-center">
          <div className="relative rounded-xl bg-white p-4 shadow-inner border border-stone-200">
            {/* QR Code Image from base64 */}
            <img
              src={`data:image/png;base64,${qrCode}`}
              alt="WhatsApp QR Code"
              className="h-64 w-64 object-contain"
            />
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-stone-600">
              Buka WhatsApp di HP Anda
            </p>
            <p className="text-xs text-stone-500 mt-1">
              Menu → Perangkat Tertaut → Tautkan Perangkat
            </p>
          </div>

          <button
            onClick={handleCopy}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-stone-200 bg-stone-50 px-4 py-2 text-sm text-stone-600 hover:bg-stone-100 transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-green-600">Tersalin!</span>
              </>
            ) : (
              <>
                <QrCode className="h-4 w-4" />
                Salin QR Code
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
