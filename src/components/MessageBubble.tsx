import { useState } from "react";
import type { Message } from "../types";
import {
  ChevronDown,
  ChevronRight,
  Clipboard,
  Check,
  Brain,
  Cpu,
  Clock,
  Coins,
  Shield,
} from "lucide-react";

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const [isOpen, setIsOpen] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const handleCopyCode = (codeText: string, blockId: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCodeId(blockId);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  // Custom Lightweight Markdown & Code Block Formatter
  const renderMarkdown = (text: string) => {
    if (!text) return null;

    const parts = text.split(/(```[\s\S]*?```)/g);

    return parts.map((part, idx) => {
      // Code Block check
      if (part.startsWith("```")) {
        const lines = part.split("\n");
        const header = lines[0].replace("```", "").trim();
        const code = lines.slice(1, -1).join("\n");
        const blockId = `code-${idx}`;

        return (
          <div key={idx} className="my-4 rounded-xl border border-white/5 bg-slate-950 overflow-hidden font-mono text-xs">
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-slate-900/60 select-none">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{header || "code"}</span>
              <button
                onClick={() => handleCopyCode(code, blockId)}
                className="flex items-center gap-1.5 text-[10px] text-slate-400 hover:text-white transition-colors"
              >
                {copiedCodeId === blockId ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <Clipboard className="w-3.5 h-3.5" />
                    Copy Code
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-slate-300 leading-relaxed font-mono">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      // Inline text formatting (lists, bold, breaks)
      const lines = part.split("\n");
      return lines.map((line, lIdx) => {
        // Bullet list
        if (line.trim().startsWith("* ") || line.trim().startsWith("- ")) {
          const content = line.trim().substring(2);
          return (
            <li key={`${idx}-${lIdx}`} className="list-disc ml-5 my-1 text-slate-300 leading-relaxed">
              {renderInlineBold(content)}
            </li>
          );
        }

        // Horizontal Rule
        if (line.trim() === "---" || line.trim() === "───") {
          return <hr key={`${idx}-${lIdx}`} className="my-4 border-white/5" />;
        }

        // Empty line
        if (!line.trim()) {
          return <div key={`${idx}-${lIdx}`} className="h-2" />;
        }

        // Normal paragraph
        return (
          <p key={`${idx}-${lIdx}`} className="my-1.5 leading-relaxed text-slate-300">
            {renderInlineBold(line)}
          </p>
        );
      });
    });
  };

  // Helper to parse bold text **like this**
  const renderInlineBold = (text: string) => {
    const boldParts = text.split(/(\*\*.*?\*\*)/g);
    return boldParts.map((bPart, bIdx) => {
      if (bPart.startsWith("**") && bPart.endsWith("**")) {
        return (
          <strong key={bIdx} className="font-semibold text-white">
            {bPart.slice(2, -2)}
          </strong>
        );
      }
      return bPart;
    });
  };

  return (
    <div
      className={`flex flex-col gap-2 max-w-[85%] ${
        isUser ? "self-end items-end" : "self-start items-start"
      }`}
    >
      {/* Role / Context info */}
      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
        <span>{isUser ? "You" : "Aether"}</span>
        <span>•</span>
        <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
      </div>

      {/* Bubble Container */}
      <div
        className={`rounded-2xl px-5 py-4 border ${
          isUser
            ? "bg-teal-500/10 border-teal-500/20 text-teal-100"
            : "bg-slate-900/60 backdrop-blur-sm border-white/5 text-slate-200"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap leading-relaxed text-xs">{message.content}</p>
        ) : (
          <div className="text-xs space-y-1">
            {renderMarkdown(message.content)}
          </div>
        )}
      </div>

      {/* Expandable Reasoning Diagnostics Drawer */}
      {!isUser && message.reasoning && (
        <div className="w-full flex flex-col border border-white/5 bg-slate-950/40 rounded-xl overflow-hidden text-[11px] mt-1">
          {/* Header click bar */}
          <div
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-between px-3.5 py-2.5 cursor-pointer bg-slate-900/40 hover:bg-slate-900/80 transition-colors select-none"
          >
            <div className="flex items-center gap-2 font-mono font-semibold text-slate-400">
              <Brain className="w-3.5 h-3.5 text-teal-400" />
              <span>Aether Reasoning Logs</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 font-mono">
                Latency: {message.reasoning.latency}s
              </span>
              {isOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              )}
            </div>
          </div>

          {/* Expandable Body */}
          {isOpen && (
            <div className="px-4 py-3.5 border-t border-white/5 space-y-4 text-slate-400 bg-slate-950/20 animate-fade-in">
              {/* Row 1: Core parameters */}
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                  <div>
                    <span className="block text-[8px] uppercase tracking-wider font-semibold text-slate-600">Model Used</span>
                    <span className="text-white font-mono text-[10px]">{message.reasoning.model}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-teal-400" />
                  <div>
                    <span className="block text-[8px] uppercase tracking-wider font-semibold text-slate-600">Processing Time</span>
                    <span className="text-white font-mono text-[10px]">{message.reasoning.latency} seconds</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <div>
                    <span className="block text-[8px] uppercase tracking-wider font-semibold text-slate-600">Confidence</span>
                    <span className="text-white font-mono text-[10px]">{Math.round(message.reasoning.confidence * 100)}%</span>
                  </div>
                </div>
              </div>

              <hr className="border-white/5" />

              {/* Row 2: Graph, Memories, and Tools */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-[9px] uppercase tracking-wider font-bold text-slate-500">Ontology References</div>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="bg-white/2 p-2 rounded-lg border border-white/3 flex items-center justify-between">
                      <span>Retrieved Memories</span>
                      <span className="text-white font-semibold font-mono">{message.reasoning.retrievedMemories}</span>
                    </div>
                    <div className="bg-white/2 p-2 rounded-lg border border-white/3 flex items-center justify-between">
                      <span>Updated Nodes</span>
                      <span className="text-white font-semibold font-mono">{message.reasoning.updatedNodes}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-[9px] uppercase tracking-wider font-bold text-slate-500">Tokens & Telemetry Cost</div>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="bg-white/2 p-2 rounded-lg border border-white/3 flex items-center justify-between">
                      <span>Usage Tokens</span>
                      <span className="text-white font-semibold font-mono">
                        {message.reasoning.promptTokens ? message.reasoning.promptTokens + (message.reasoning.completionTokens || 0) : "—"}
                      </span>
                    </div>
                    <div className="bg-white/2 p-2 rounded-lg border border-white/3 flex items-center justify-between">
                      <span>Calculated Cost</span>
                      <span className="text-amber-400 font-semibold font-mono flex items-center gap-0.5">
                        <Coins className="w-3 h-3 text-amber-500" />
                        ${message.reasoning.totalCost?.toFixed(5) || "—"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 3: Tools Invoked */}
              <div className="space-y-2">
                <div className="text-[9px] uppercase tracking-wider font-bold text-slate-500">Tools Invoked during Cognition</div>
                <div className="space-y-1">
                  {message.reasoning.toolCalls && message.reasoning.toolCalls.length > 0 ? (
                    message.reasoning.toolCalls.map((tool, tIdx) => (
                      <div
                        key={tIdx}
                        className="font-mono text-[9px] bg-slate-950 border border-white/5 px-2.5 py-1.5 rounded-md text-emerald-400 truncate"
                      >
                        {tool}
                      </div>
                    ))
                  ) : (
                    <div className="text-[10px] text-slate-600 font-mono italic">No external tool invocations.</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
