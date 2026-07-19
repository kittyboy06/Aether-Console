import { useEffect, useState } from "react";
import { fetchGraphSnapshot } from "../api/graph";
import type { GraphSnapshot } from "../types";
import { RefreshCw, Database, GitMerge, Layers, Hash } from "lucide-react";

export default function GraphView() {
  const [snapshot, setSnapshot] = useState<GraphSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("ALL");

  const loadGraph = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchGraphSnapshot();
      setSnapshot(data);
    } catch (err: any) {
      setError("Failed to load graph snapshot: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGraph();
  }, []);

  const nodeTypes = snapshot
    ? Array.from(new Set(snapshot.nodes.map((n) => n.type)))
    : [];

  const filteredNodes = snapshot
    ? filterType === "ALL"
      ? snapshot.nodes
      : snapshot.nodes.filter((n) => n.type === filterType)
    : [];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-900/40 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <GitMerge className="w-5 h-5 text-teal-400" />
            Knowledge Graph Diagnostics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time ontology explorer showing semantic memories and associations
          </p>
        </div>
        <button
          onClick={loadGraph}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium glass-btn text-teal-300 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Reload Graph
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-950/30 border border-red-500/20 text-red-400 text-xs">
          {error}
        </div>
      )}

      {loading && !snapshot ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 text-teal-400 animate-spin" />
            <p className="text-xs text-slate-400">Fetching graph snapshot from server...</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0 gap-6">
          {/* Tiers Summary Stats */}
          {snapshot && (
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 rounded-xl glass-panel flex items-center gap-4">
                <div className="p-2.5 rounded-lg bg-teal-500/10 text-teal-400">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {snapshot.nodes.length}
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    Buffered Nodes
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl glass-panel flex items-center gap-4">
                <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {snapshot.tiers.active || 0}
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    Active Tier
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl glass-panel flex items-center gap-4">
                <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                  <Hash className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {snapshot.tiers.cold || 0}
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    Cold Tier
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl glass-panel flex items-center gap-4">
                <div className="p-2.5 rounded-lg bg-slate-500/10 text-slate-400">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {snapshot.edges.length}
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    Active Edges
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Node and Edge Grid */}
          <div className="flex-1 grid grid-cols-3 min-h-0 gap-6">
            {/* Nodes Explorer */}
            <div className="col-span-2 flex flex-col min-h-0 glass-panel rounded-2xl p-4">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
                <h3 className="text-sm font-semibold text-white">Entities & Concepts ({filteredNodes.length})</h3>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-slate-900 border border-white/10 rounded-md text-xs px-2 py-1 text-slate-300 focus:outline-none"
                >
                  <option value="ALL">All Types</option>
                  {nodeTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1 overflow-y-auto pr-1">
                {filteredNodes.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-10">No matching nodes in graph.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {filteredNodes.map((node) => (
                      <div
                        key={node.id}
                        className="p-3 rounded-lg border border-white/5 bg-slate-950/40 flex flex-col gap-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-400 font-semibold uppercase font-mono">
                            {node.type}
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                            node.memoryTier === "ACTIVE" ? "bg-emerald-500/10 text-emerald-400" : "bg-cyan-500/10 text-cyan-400"
                          }`}>
                            {node.memoryTier}
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-white truncate">{node.name}</h4>
                        <span className="text-[9px] text-slate-500 font-mono truncate">{node.id}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Edges Explorer */}
            <div className="flex flex-col min-h-0 glass-panel rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-white mb-4 pb-2 border-b border-white/5">
                Semantic Edges ({snapshot?.edges.length || 0})
              </h3>
              <div className="flex-1 overflow-y-auto pr-1">
                {!snapshot || snapshot.edges.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-10">No semantic associations found.</p>
                ) : (
                  <div className="space-y-3">
                    {snapshot.edges.map((edge, idx) => {
                      const sourceNode = snapshot.nodes.find((n) => n.id === edge.source);
                      const targetNode = snapshot.nodes.find((n) => n.id === edge.target);

                      return (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg border border-white/5 bg-slate-950/20 text-[11px] flex flex-col gap-1"
                        >
                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span className="font-semibold text-white truncate max-w-[80px]">
                              {sourceNode?.name || "Source"}
                            </span>
                            <span className="text-[9px] font-mono px-1 py-0.2 bg-purple-500/10 text-purple-400 rounded">
                              {edge.type}
                            </span>
                            <span className="font-semibold text-white truncate max-w-[80px]">
                              {targetNode?.name || "Target"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[9px] text-slate-600 font-mono">
                            <span className="truncate max-w-[60px]">{edge.source}</span>
                            <span>→</span>
                            <span className="truncate max-w-[60px]">{edge.target}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
