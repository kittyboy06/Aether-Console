import { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";
import type { Message } from "../types";
import { Sparkles, Terminal } from "lucide-react";

function PipelineLoaderText() {
  const [stepIndex, setStepIndex] = useState(0);
  const steps = [
    "Retrieving semantic memories...",
    "Optimizing cognitive plan...",
    "Executing multi-provider reasoning...",
    "Evaluating self-consistency & meta-cognition...",
    "Synthesizing response output..."
  ];

  useEffect(() => {
    const intervals = [3500, 4500, 6000, 8000];
    const timers: number[] = [];
    let accumulatedTime = 0;
    
    intervals.forEach((time, index) => {
      accumulatedTime += time;
      const timer = setTimeout(() => {
        setStepIndex(index + 1);
      }, accumulatedTime);
      timers.push(timer);
    });

    return () => {
      timers.forEach(t => clearTimeout(t));
    };
  }, []);

  return <span>{steps[stepIndex]}</span>;
}

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export default function ChatWindow({ messages, isLoading, error }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="w-full h-full flex flex-col overflow-y-auto px-4 py-4 md:px-6 md:py-6 space-y-4 md:space-y-6">
      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3 select-none">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/25 flex items-center justify-center text-teal-400">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-white">Aether Reference Client</h2>
            <p className="text-[11px] text-slate-500 max-w-[280px] leading-relaxed">
              Begin a diagnostic conversation session to verify memory retrievals, reasoning steps, and model routing.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-grow flex flex-col space-y-6">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {/* Core Pipeline Shimmer loader */}
          {isLoading && messages.length > 0 && messages[messages.length - 1].pending && (
            <div className="flex flex-col gap-2 max-w-[85%] self-start select-none">
              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                <Terminal className="w-3 h-3 text-teal-500 animate-spin" />
                <PipelineLoaderText />
              </div>
              <div className="rounded-2xl px-4 py-3 bg-slate-900 border border-white/5 space-y-2.5 w-[300px]">
                <div className="h-3 w-3/4 rounded bg-slate-800 shimmer"></div>
                <div className="h-3 w-1/2 rounded bg-slate-800 shimmer"></div>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg border border-red-500/20 bg-red-950/20 text-red-400 text-xs font-medium self-center">
          {error}
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
