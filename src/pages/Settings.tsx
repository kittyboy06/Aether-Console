import { useState } from "react";
import { Settings as SettingsIcon, ShieldAlert, Trash2, CheckCircle } from "lucide-react";

export default function Settings() {
  const [apiUrl, setApiUrl] = useState(() => localStorage.getItem("aether_api_override") || import.meta.env.VITE_AETHER_API || "https://bakedpotato.tailb944f3.ts.net");
  const [success, setSuccess] = useState<string | null>(null);

  const handleSave = () => {
    localStorage.setItem("aether_api_override", apiUrl);
    setSuccess("Console API settings saved. Reload to apply.");
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleClearCache = () => {
    const keys = ["aether_conversations_cache", "aether_sync_queue"];
    for (const key of keys) {
      localStorage.removeItem(key);
    }
    // Remove all cached message items
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("aether_messages_cache_")) {
        localStorage.removeItem(key);
      }
    });
    setSuccess("Local message cache cleared successfully.");
    setTimeout(() => setSuccess(null), 3000);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-900/40 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-slate-400" />
            Console Config & Parameters
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure reference client properties, local cache sizes, and overrides
          </p>
        </div>
      </div>

      {success && (
        <div className="mb-6 p-4 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          {success}
        </div>
      )}

      <div className="max-w-2xl space-y-6">
        {/* API Endpoint Panel */}
        <div className="p-5 rounded-2xl glass-panel space-y-4">
          <h3 className="text-sm font-semibold text-white">API URL Override</h3>
          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-400 font-medium">Aether Endpoint</label>
            <div className="flex gap-3">
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="https://bakedpotato.tailb944f3.ts.net"
                className="flex-1 bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500/50"
              />
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-teal-500 hover:bg-teal-600 active:scale-[0.98] transition-all rounded-lg text-xs font-semibold text-slate-950"
              >
                Save Url
              </button>
            </div>
            <p className="text-[10px] text-slate-500">
              Default is read from .env configuration (`import.meta.env.VITE_AETHER_API`).
            </p>
          </div>
        </div>

        {/* Maintenance Panel */}
        <div className="p-5 rounded-2xl glass-panel space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            LocalStorage Maintenance
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            If you're encountering inconsistent state transitions during development or wish to purge the optimistically cached messages and sync queues:
          </p>
          <button
            onClick={handleClearCache}
            className="flex items-center gap-2 px-4 py-2 border border-red-500/20 bg-red-950/20 hover:bg-red-950/40 text-red-400 rounded-lg text-xs font-medium transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Purge Local Cache
          </button>
        </div>
      </div>
    </div>
  );
}
