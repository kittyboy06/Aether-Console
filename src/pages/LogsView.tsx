import { useEffect, useState, useRef } from "react";
import { fetchTelemetryLogs } from "../api/health";
import type { TelemetryLog } from "../types";
import { Terminal, RefreshCw, AlertTriangle, AlertCircle, Info } from "lucide-react";

export default function LogsView() {
  const [logs, setLogs] = useState<TelemetryLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("ALL");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await fetchTelemetryLogs();
      setLogs(data);
      setError(null);
    } catch (err: any) {
      setError("Failed to fetch logs: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  // Auto-refresh interval loop
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      loadLogs();
    }, 3000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Scroll to bottom on updates
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  const filteredLogs = logs.filter((log) => {
    if (filter === "ALL") return true;
    return log.type === filter;
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-900/40 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-indigo-400" />
            Core Engine Telemetry & Logs
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Live trace logs of blackboard transactions, agent coordinations, and database events
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-300 select-none cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="accent-indigo-500 rounded border-white/10"
            />
            Auto-Refresh (3s)
          </label>
          <button
            onClick={loadLogs}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium glass-btn text-indigo-300 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-950/30 border border-red-500/20 text-red-400 text-xs">
          {error}
        </div>
      )}

      {/* Terminal View */}
      <div className="flex-1 flex flex-col min-h-0 bg-slate-950 border border-white/10 rounded-2xl overflow-hidden font-mono text-xs">
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-slate-900/60 select-none">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/60"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/60"></div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setFilter("ALL")}
              className={`text-[10px] uppercase font-bold tracking-wider ${
                filter === "ALL" ? "text-indigo-400" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("INFO")}
              className={`text-[10px] uppercase font-bold tracking-wider flex items-center gap-1 ${
                filter === "INFO" ? "text-blue-400" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <Info className="w-3 h-3" /> Info
            </button>
            <button
              onClick={() => setFilter("WARNING")}
              className={`text-[10px] uppercase font-bold tracking-wider flex items-center gap-1 ${
                filter === "WARNING" ? "text-yellow-400" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <AlertTriangle className="w-3 h-3" /> Warning
            </button>
            <button
              onClick={() => setFilter("ERROR")}
              className={`text-[10px] uppercase font-bold tracking-wider flex items-center gap-1 ${
                filter === "ERROR" ? "text-red-400" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <AlertCircle className="w-3 h-3" /> Error
            </button>
          </div>
        </div>

        {/* Terminal Logs List */}
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto p-4 space-y-2.5 scroll-smooth"
        >
          {filteredLogs.length === 0 ? (
            <p className="text-slate-600 text-center py-20">No telemetry log traces found in window.</p>
          ) : (
            filteredLogs.map((log, idx) => {
              let logColor = "text-slate-300";
              let LogIcon = Info;
              if (log.type === "WARNING") {
                logColor = "text-yellow-400 bg-yellow-500/5";
                LogIcon = AlertTriangle;
              } else if (log.type === "ERROR") {
                logColor = "text-red-400 bg-red-500/5";
                LogIcon = AlertCircle;
              } else {
                logColor = "text-slate-300";
                LogIcon = Info;
              }

              return (
                <div
                  key={idx}
                  className={`flex items-start gap-2.5 p-1 rounded hover:bg-white/3 transition-colors ${logColor}`}
                >
                  <span className="text-slate-500 select-none">
                    [{new Date(log.timestamp).toLocaleTimeString()}]
                  </span>
                  <LogIcon className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <span className="flex-1 whitespace-pre-wrap leading-relaxed">
                    {log.message}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
