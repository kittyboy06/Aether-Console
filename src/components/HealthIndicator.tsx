import { useState, useEffect } from "react";
import { fetchHealthSnapshot } from "../api/health";
import { Activity, Database } from "lucide-react";

interface HealthIndicatorProps {
  isOnline: boolean;
  model: string;
  environment: string;
}

export default function HealthIndicator({
  isOnline,
  model,
  environment,
}: HealthIndicatorProps) {
  const [stats, setStats] = useState<{
    latency: number;
    nodes: number;
    dbStatus: string;
  }>({
    latency: 0,
    nodes: 0,
    dbStatus: "unknown",
  });

  const getFriendlyModelName = (id: string) => {
    if (id === "gemini-2.5-flash") return "Gemini 2.5 Flash";
    if (id === "gemini-2.5-pro") return "Gemini 2.5 Pro";
    if (id.includes("nemotron")) return "Nemotron 3 Super";
    return id;
  };

  const getStatus = () => {
    if (!isOnline) return "offline";
    if (stats.dbStatus === "DISCONNECTED") return "offline";
    return "connected";
  };

  const status = getStatus();

  const queryHealth = async () => {
    if (!isOnline) return;
    const t0 = performance.now();
    try {
      const data = await fetchHealthSnapshot();
      const latency = Math.round(performance.now() - t0);
      setStats({
        latency,
        nodes: data.stats?.knowledgeNodes || 0,
        dbStatus: data.database || "CONNECTED",
      });
    } catch (_) {
      setStats((prev) => ({
        ...prev,
        dbStatus: "DISCONNECTED",
      }));
    }
  };

  useEffect(() => {
    queryHealth();
    const interval = setInterval(() => {
      queryHealth();
    }, 10000); // query health every 10 seconds

    return () => clearInterval(interval);
  }, [isOnline]);

  return (
    <div className="p-4 border-t border-white/5 bg-slate-950/40 select-none space-y-3">
      {/* Status indicator */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Engine Status</span>
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${
            status === "connected" ? "bg-emerald-400 animate-pulse" : "bg-red-500"
          }`} />
          <span className={`text-[10px] font-bold ${
            status === "connected" ? "text-emerald-400" : "text-red-500"
          }`}>
            {status === "connected" ? "Connected" : "Offline"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
        {/* Latency */}
        <div className="flex items-center gap-1.5 bg-white/2 rounded-md p-1.5 border border-white/3">
          <Activity className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
          <div className="truncate">
            <div className="text-[8px] text-slate-500 uppercase tracking-wider font-semibold">Latency</div>
            <div className="font-semibold text-white font-mono">{status === "connected" ? `${stats.latency} ms` : "—"}</div>
          </div>
        </div>

        {/* Knowledge Nodes */}
        <div className="flex items-center gap-1.5 bg-white/2 rounded-md p-1.5 border border-white/3">
          <Database className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
          <div className="truncate">
            <div className="text-[8px] text-slate-500 uppercase tracking-wider font-semibold">Graph Nodes</div>
            <div className="font-semibold text-white font-mono">{status === "connected" ? stats.nodes.toLocaleString() : "—"}</div>
          </div>
        </div>
      </div>

      {/* Model & Config */}
      <div className="bg-slate-950/40 border border-white/5 rounded-lg p-2 space-y-1.5 text-[9px]">
        <div className="flex justify-between items-center text-slate-500">
          <span>Active Stage Router</span>
          <span className="font-semibold text-indigo-400 truncate max-w-[100px]">{getFriendlyModelName(model)}</span>
        </div>
        <div className="flex justify-between items-center text-slate-500">
          <span>Deployment Env</span>
          <span className={`font-semibold uppercase tracking-wider ${
            environment === "Live" ? "text-amber-400" : "text-teal-400"
          }`}>{environment}</span>
        </div>
      </div>
    </div>
  );
}
