import { Activity, Trash2, Download } from 'lucide-react';

interface Log {
  id: number;
  message: string;
  timestamp: Date;
}

interface LogsPanelProps {
  logs: Log[];
}

export function LogsPanel({ logs }: LogsPanelProps) {
  const handleClear = () => {
    // This will be handled by parent through a callback
  };

  const handleExport = () => {
    const content = logs.map(log => log.message).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wa-engine-logs-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary-600" />
          <h3 className="text-sm font-semibold text-stone-800">Log Aktivitas</h3>
          <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-500">
            {logs.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleExport}
            disabled={logs.length === 0}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600 disabled:opacity-50 transition-colors"
            title="Export Logs"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="bg-stone-900 rounded-lg p-3 h-64 overflow-y-auto font-mono text-xs">
        {logs.length === 0 ? (
          <p className="text-stone-500">Belum ada log...</p>
        ) : (
          <div className="space-y-1">
            {logs.map((log) => (
              <div key={log.id} className="text-stone-300">
                {log.message}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
