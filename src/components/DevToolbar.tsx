import { Cpu, HardDrive, RefreshCw } from "lucide-react";

interface DevToolbarProps {
  model: string;
  setModel: (m: string) => void;
  environment: string;
  setEnvironment: (e: string) => void;
  discoveredModels?: any[];
}

export default function DevToolbar({
  model,
  setModel,
  environment,
  setEnvironment,
  discoveredModels,
}: DevToolbarProps) {
  const handleResetConversation = () => {
    window.location.reload();
  };

  const handleClearCache = () => {
    localStorage.removeItem("aether_conversations_cache");
    alert("Memory cache flushed locally.");
  };

  return (
    <div className="h-auto min-h-14 py-2.5 sm:py-0 border-b border-white/5 bg-slate-900/40 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-6 gap-3 select-none z-10 flex-shrink-0">
      {/* Configuration selectors */}
      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
        {/* Environment */}
        <div className="flex items-center gap-2">
          <HardDrive className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Env:</span>
          <select
            value={environment}
            onChange={(e) => setEnvironment(e.target.value)}
            className="bg-transparent text-xs font-semibold text-teal-400 focus:outline-none cursor-pointer border-none p-0 pr-1"
          >
            <option value="Live" className="bg-slate-950 text-slate-200">Live Cloud</option>
            <option value="Local" className="bg-slate-950 text-slate-200">Local Deno</option>
            <option value="Mock" className="bg-slate-950 text-slate-200">Mock Sandbox</option>
          </select>
        </div>

        {/* Provider */}
        <div className="flex items-center gap-2 sm:border-l border-white/5 sm:pl-6">
          <Cpu className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Model:</span>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="bg-transparent text-xs font-semibold text-indigo-400 focus:outline-none cursor-pointer border-none p-0 pr-1"
          >
            {discoveredModels && discoveredModels.length > 0 ? (
              discoveredModels.map((m) => (
                <option key={m.model_id} value={m.model_id} className="bg-slate-950 text-slate-200">
                  {m.model_name}
                </option>
              ))
            ) : (
              <>
                <option value="gemini-1.5-flash" className="bg-slate-950 text-slate-200">Gemini 1.5 Flash</option>
                <option value="gemini-1.5-pro" className="bg-slate-950 text-slate-200">Gemini 1.5 Pro</option>
                <option value="nvidia/nemotron-3-super-120b-a12b" className="bg-slate-950 text-slate-200">Nemotron 3 Super</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 border-t sm:border-t-0 border-white/5 pt-2.5 sm:pt-0">
        <button
          onClick={handleClearCache}
          title="Flushes LocalStorage session caches"
          className="text-xs font-medium text-slate-400 hover:text-white px-2.5 py-1 rounded border border-white/5 hover:border-white/10 transition-colors"
        >
          Clear Cache
        </button>

        <button
          onClick={handleResetConversation}
          title="Hard reset of active session"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-950 bg-teal-400 hover:bg-teal-500 active:scale-[0.98] transition-all px-3 py-1.5 rounded-lg"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset Chat
        </button>
      </div>
    </div>
  );
}
