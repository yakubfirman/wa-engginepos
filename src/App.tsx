import { useState, useEffect } from 'react';
import { Phone, Settings, Activity, MessageSquare, X, Check, Loader2 } from 'lucide-react';
import { Header } from './components/Header';
import { StatusCard } from './components/StatusCard';
import { SettingsPanel } from './components/SettingsPanel';
import { QRDisplay } from './components/QRDisplay';
import { SendReceipt } from './components/SendReceipt';
import { LogsPanel } from './components/LogsPanel';

type Page = 'home' | 'settings';

interface Log {
  id: number;
  message: string;
  timestamp: Date;
}

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [waStatus, setWaStatus] = useState<'offline' | 'connecting' | 'connected' | 'error'>('offline');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [config, setConfig] = useState<Record<string, unknown>>({});
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);

  useEffect(() => {
    loadConfig();
    loadStatus();
    setupListeners();

    return () => {
      // Cleanup listeners
    };
  }, []);

  const loadConfig = async () => {
    try {
      const cfg = await window.electronAPI.getConfig();
      setConfig(cfg);
    } catch (err) {
      console.error('Failed to load config:', err);
    }
  };

  const loadStatus = async () => {
    try {
      const status = await window.electronAPI.getWhatsAppStatus();
      setWaStatus(status as 'offline' | 'connecting' | 'connected' | 'error');
    } catch (err) {
      console.error('Failed to load status:', err);
    }
  };

  const setupListeners = () => {
    window.electronAPI.onWhatsAppQR((qr) => {
      setQrCode(qr);
      setIsStarting(false);
    });

    window.electronAPI.onWhatsAppStatus((status) => {
      setWaStatus(status as 'offline' | 'connecting' | 'connected' | 'error');
      if (status === 'connected') {
        setQrCode(null);
        setIsStarting(false);
        setIsStopping(false);
      } else if (status === 'offline') {
        setQrCode(null);
        setIsStarting(false);
        setIsStopping(false);
      }
    });

    window.electronAPI.onWhatsAppError((errorMsg) => {
      setError(errorMsg);
      setIsStarting(false);
      setIsStopping(false);
    });

    window.electronAPI.onWhatsAppLogs((log) => {
      setLogs((prev) => [
        ...prev,
        { id: Date.now(), message: log, timestamp: new Date() },
      ].slice(-100));
    });
  };

  const handleStart = async () => {
    setIsStarting(true);
    setError(null);
    setLogs([]);
    const result = await window.electronAPI.startWhatsApp();
    if (!result.success) {
      setError(result.error || 'Gagal memulai');
      setIsStarting(false);
    }
  };

  const handleStop = async () => {
    setIsStopping(true);
    const result = await window.electronAPI.stopWhatsApp();
    if (!result.success) {
      setError(result.error || 'Gagal menghentikan');
      setIsStopping(false);
    }
  };

  const handleSaveConfig = async (newConfig: Record<string, unknown>) => {
    try {
      const saved = await window.electronAPI.setConfig(newConfig);
      setConfig(saved);
      return true;
    } catch (err) {
      setError('Gagal menyimpan konfigurasi');
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        currentPage={currentPage}
        onNavigate={(page) => {
          setCurrentPage(page);
          setError(null);
        }}
      />

      <main className="p-6">
        {currentPage === 'home' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Status & Actions */}
            <div className="lg:col-span-2 space-y-6">
              <StatusCard
                status={waStatus}
                config={config}
                isStarting={isStarting}
                isStopping={isStopping}
                onStart={handleStart}
                onStop={handleStop}
                onOpenSettings={() => setCurrentPage('settings')}
              />

              {waStatus === 'offline' && !qrCode && (
                <QRDisplay qrCode={null} isWaiting />
              )}

              {qrCode && (
                <QRDisplay qrCode={qrCode} isWaiting={false} />
              )}

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                  <div className="flex items-start gap-3">
                    <X className="w-5 h-5 text-red-500 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-red-800">Error</h4>
                      <p className="text-sm text-red-600 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {waStatus === 'connected' && (
                <SendReceipt />
              )}
            </div>

            {/* Right Column - Logs */}
            <div className="space-y-6">
              <LogsPanel logs={logs} />

              <div className="card">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-5 h-5 text-primary-600" />
                  <h3 className="text-sm font-semibold text-stone-800">Info Server</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Host</span>
                    <span className="text-stone-700 font-mono">
                      {(config.serverHost as string) || '0.0.0.0'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Port</span>
                    <span className="text-stone-700 font-mono">
                      {(config.serverPort as number) || 3001}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">URL API</span>
                    <span className="text-stone-700 font-mono text-xs truncate max-w-[120px]">
                      {(config.greenposUrl as string) || '-'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentPage === 'settings' && (
          <SettingsPanel
            config={config}
            onSave={handleSaveConfig}
            onBack={() => setCurrentPage('home')}
          />
        )}
      </main>
    </div>
  );
}

export default App;
