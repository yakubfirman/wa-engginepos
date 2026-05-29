import { useState } from 'react';
import { ArrowLeft, Save, Loader2, CheckCircle, Server, Globe, Smartphone, Key } from 'lucide-react';

interface SettingsPanelProps {
  config: Record<string, unknown>;
  onSave: (config: Record<string, unknown>) => Promise<boolean>;
  onBack: () => void;
}

export function SettingsPanel({ config, onSave, onBack }: SettingsPanelProps) {
  const [serverHost, setServerHost] = useState((config.serverHost as string) || '0.0.0.0');
  const [serverPort, setServerPort] = useState((config.serverPort as number) || 3001);
  const [greenposUrl, setGreenposUrl] = useState((config.greenposUrl as string) || 'http://localhost:8000');
  const [greenposApiKey, setGreenposApiKey] = useState((config.greenposApiKey as string) || '');
  const [deviceName, setDeviceName] = useState((config.deviceName as string) || 'WA Engine');
  const [autoStart, setAutoStart] = useState((config.autoStart as boolean) || false);

  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    setSaved(false);

    const newConfig = {
      serverHost,
      serverPort,
      greenposUrl,
      greenposApiKey,
      deviceName,
      autoStart,
    };

    const success = await onSave(newConfig);

    setIsSaving(false);
    if (success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-stone-600 hover:text-stone-800 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Beranda
      </button>

      <div className="card">
        <h2 className="text-lg font-semibold text-stone-800 mb-6">Pengaturan</h2>

        {/* Server Settings */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Server className="h-5 w-5 text-primary-600" />
            <h3 className="text-sm font-semibold text-stone-800">Server</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label mb-1.5 block">Host</label>
              <input
                type="text"
                value={serverHost}
                onChange={(e) => setServerHost(e.target.value)}
                className="input-field"
                placeholder="0.0.0.0"
              />
              <p className="mt-1 text-xs text-stone-500">0.0.0.0 untuk semua interface, 127.0.0.1 untuk lokal saja</p>
            </div>

            <div>
              <label className="label mb-1.5 block">Port</label>
              <input
                type="number"
                value={serverPort}
                onChange={(e) => setServerPort(parseInt(e.target.value) || 3001)}
                className="input-field"
                placeholder="3001"
              />
              <p className="mt-1 text-xs text-stone-500">Port untuk API server (default: 3001)</p>
            </div>
          </div>
        </div>

        {/* GreenPOS Integration */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-5 w-5 text-primary-600" />
            <h3 className="text-sm font-semibold text-stone-800">Integrasi GreenPOS</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label mb-1.5 block">URL GreenPOS</label>
              <input
                type="url"
                value={greenposUrl}
                onChange={(e) => setGreenposUrl(e.target.value)}
                className="input-field"
                placeholder="http://localhost:8000"
              />
              <p className="mt-1 text-xs text-stone-500">URL utama instalasi GreenPOS Anda</p>
            </div>

            <div>
              <label className="label mb-1.5 block">API Key</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <input
                  type="password"
                  value={greenposApiKey}
                  onChange={(e) => setGreenposApiKey(e.target.value)}
                  className="input-field pl-10"
                  placeholder="Masukkan API Key..."
                />
              </div>
              <p className="mt-1 text-xs text-stone-500">API Key untuk autentikasi dengan GreenPOS</p>
            </div>
          </div>
        </div>

        {/* Device Settings */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Smartphone className="h-5 w-5 text-primary-600" />
            <h3 className="text-sm font-semibold text-stone-800">Perangkat</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label mb-1.5 block">Nama Perangkat</label>
              <input
                type="text"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                className="input-field"
                placeholder="WA Engine"
              />
              <p className="mt-1 text-xs text-stone-500">Nama yang muncul di WhatsApp Web</p>
            </div>

            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoStart}
                  onChange={(e) => setAutoStart(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
              <div>
                <span className="text-sm font-medium text-stone-700">Mulai otomatis saat buka</span>
                <p className="text-xs text-stone-500">WhatsApp akan langsung terhubung saat aplikasi dibuka</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-stone-200">
          <div className="flex items-center gap-2">
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                Tersimpan!
              </span>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Simpan Pengaturan
              </>
            )}
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 rounded-lg bg-blue-50 border border-blue-200 p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Informasi</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Server port harus unik dan tidak digunakan aplikasi lain</li>
          <li>• API Key diperlukan untuk keamanan komunikasi dengan GreenPOS</li>
          <li>• Untuk deploy ke VPS, gunakan Express server yang sudah di-config</li>
        </ul>
      </div>
    </div>
  );
}