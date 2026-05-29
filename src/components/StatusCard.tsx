import { Loader2, Wifi, WifiOff, AlertCircle, Settings } from 'lucide-react';

interface StatusCardProps {
  status: 'offline' | 'connecting' | 'connected' | 'error';
  config: Record<string, unknown>;
  isStarting: boolean;
  isStopping: boolean;
  onStart: () => void;
  onStop: () => void;
  onOpenSettings: () => void;
}

export function StatusCard({
  status,
  config,
  isStarting,
  isStopping,
  onStart,
  onStop,
  onOpenSettings,
}: StatusCardProps) {
  const statusConfig = {
    offline: {
      icon: WifiOff,
      label: 'Offline',
      color: 'text-stone-500',
      bgColor: 'bg-stone-100',
      dotColor: 'bg-stone-400',
      description: 'WhatsApp belum terhubung. Klik tombol mulai untuk memulai.',
    },
    connecting: {
      icon: Loader2,
      label: 'Menghubungkan',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      dotColor: 'bg-amber-500',
      description: 'Menunggu scan QR Code...',
    },
    connected: {
      icon: Wifi,
      label: 'Terhubung',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      dotColor: 'bg-green-500',
      description: 'WhatsApp siap digunakan untuk mengirim struk.',
    },
    error: {
      icon: AlertCircle,
      label: 'Error',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      dotColor: 'bg-red-500',
      description: 'Terjadi kesalahan. Cek log untuk detail.',
    },
  };

  const current = statusConfig[status];
  const Icon = current.icon;

  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className={`flex h-12 w-12 items-center justify-center rounded-full ${current.bgColor}`}>
            <Icon className={`h-6 w-6 ${current.color} ${status === 'connecting' ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-stone-800">Status WhatsApp</h2>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${current.bgColor} ${current.color}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${current.dotColor} ${status === 'connecting' ? 'animate-pulse' : ''}`} />
                {current.label}
              </span>
            </div>
            <p className="mt-1 text-sm text-stone-500">{current.description}</p>
          </div>
        </div>

        <button
          onClick={onOpenSettings}
          className="rounded-lg p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors"
          title="Pengaturan"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {(status === 'offline' || status === 'error') && (
          <button
            onClick={onStart}
            disabled={isStarting}
            className="btn-primary"
          >
            {isStarting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Memulai...
              </>
            ) : (
              'Mulai WhatsApp'
            )}
          </button>
        )}

        {status === 'connecting' && (
          <button
            onClick={onStop}
            disabled={isStopping}
            className="btn-secondary"
          >
            {isStopping ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Menghentikan...
              </>
            ) : (
              'Batalkan'
            )}
          </button>
        )}

        {status === 'connected' && (
          <button
            onClick={onStop}
            disabled={isStopping}
            className="btn-danger"
          >
            {isStopping ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Menghentikan...
              </>
            ) : (
              'Putus WhatsApp'
            )}
          </button>
        )}
      </div>

      {status === 'connected' && (
        <div className="mt-4 rounded-lg bg-stone-50 p-3">
          <div className="flex items-center gap-2 text-sm text-stone-600">
            <span className="font-medium">Perangkat:</span>
            <span>{(config.deviceName as string) || 'WA Engine'}</span>
          </div>
        </div>
      )}
    </div>
  );
}
