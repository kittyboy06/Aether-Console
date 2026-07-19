import { useState, useRef, useEffect } from "react";
import { Send, UploadCloud, Paperclip } from "lucide-react";

interface ChatInputProps {
  onSend: (text: string) => void;
  isLoading: boolean;
}

export default function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [text, setText] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  }, [text]);

  const handleSend = () => {
    if (text.trim() && !isLoading) {
      onSend(text.trim());
      setText("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Drag and drop event handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    alert("Attachment support is Coming Soon! Drag & drop will allow sending PDFs, Images, Audio, and Text files.");
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="p-4 border-t border-white/5 bg-slate-950/20 backdrop-blur-md relative"
    >
      {/* Drag & Drop Coming Soon Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm border-2 border-dashed border-teal-500/40 m-2 rounded-xl flex items-center justify-center gap-3 text-teal-400 select-none z-20 pointer-events-none animate-pulse">
          <UploadCloud className="w-6 h-6" />
          <span className="text-xs font-semibold uppercase tracking-wider">Coming Soon: Attachments Drop Support</span>
        </div>
      )}

      {/* Input container */}
      <div className="max-w-4xl mx-auto flex items-end gap-3 rounded-xl border border-white/8 bg-slate-950 px-4 py-2.5 shadow-2xl relative">
        <button
          onClick={() => alert("Attachment support is Coming Soon!")}
          className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors rounded-lg mb-0.5"
          title="Attach files (Coming Soon)"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... (Press Enter to send)"
          className="flex-grow bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none resize-none text-xs leading-relaxed py-1.5 max-h-[200px]"
        />

        <button
          onClick={handleSend}
          disabled={!text.trim() || isLoading}
          className="p-2 rounded-xl bg-teal-400 hover:bg-teal-500 active:scale-[0.96] text-slate-950 disabled:bg-slate-800 disabled:text-slate-500 disabled:scale-100 transition-all mb-0.5"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
