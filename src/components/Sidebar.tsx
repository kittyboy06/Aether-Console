import { useState, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import type { Conversation } from "../types";
import HealthIndicator from "./HealthIndicator";
import {
  MessageSquare,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  GitMerge,
  Terminal,
  Settings as SettingsIcon,
  Compass,
} from "lucide-react";

interface SidebarProps {
  conversations: Conversation[];
  currentId: string | null;
  setCurrentId: (id: string | null) => void;
  createNewChat: () => void;
  renameChat: (id: string, title: string) => void;
  deleteChat: (id: string) => void;
  isOnline: boolean;
  model: string;
  environment: string;
}

export default function Sidebar({
  conversations,
  currentId,
  setCurrentId,
  createNewChat,
  renameChat,
  deleteChat,
  isOnline,
  model,
  environment,
}: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  // Group conversations by date
  const groupedConversations = useMemo(() => {
    const today: Conversation[] = [];
    const yesterday: Conversation[] = [];
    const lastWeek: Conversation[] = [];
    const older: Conversation[] = [];

    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;

    conversations.forEach((c) => {
      const date = new Date(c.updatedAt || c.createdAt);
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / oneDay);

      if (diffDays <= 1) {
        today.push(c);
      } else if (diffDays <= 2) {
        yesterday.push(c);
      } else if (diffDays <= 7) {
        lastWeek.push(c);
      } else {
        older.push(c);
      }
    });

    return { today, yesterday, lastWeek, older };
  }, [conversations]);

  const startEditing = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const cancelEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const saveRename = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      renameChat(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const confirmDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this conversation?")) {
      deleteChat(id);
    }
  };

  const renderChatItem = (c: Conversation) => {
    const isActive = currentId === c.id && location.pathname === "/";
    const isEditing = editingId === c.id;

    return (
      <div
        key={c.id}
        onClick={() => {
          if (!isEditing) {
            setCurrentId(c.id);
            // Navigate to root chat page
            if (location.pathname !== "/") {
              navigate("/");
            }
          }
        }}
        className={`group relative flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-xs transition-colors ${
          isActive
            ? "bg-teal-500/10 text-teal-400 border border-teal-500/20"
            : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-200"
        }`}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="bg-slate-950 border border-teal-500/40 rounded px-1.5 py-0.5 text-xs text-slate-200 w-full focus:outline-none"
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          ) : (
            <span className="truncate font-medium">{c.title}</span>
          )}
        </div>

        {/* Hover Actions */}
        {!isEditing ? (
          <div className="hidden group-hover:flex items-center gap-1.5 pl-2 flex-shrink-0 bg-transparent">
            <button
              onClick={(e) => startEditing(c.id, c.title, e)}
              className="p-1 hover:text-slate-200 text-slate-500 rounded transition-colors"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => confirmDelete(c.id, e)}
              className="p-1 hover:text-red-400 text-slate-500 rounded transition-colors"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1 pl-2 flex-shrink-0">
            <button
              onClick={(e) => saveRename(c.id, e)}
              className="p-1 text-emerald-400 hover:text-emerald-300 rounded"
            >
              <Check className="w-3 h-3" />
            </button>
            <button
              onClick={cancelEditing}
              className="p-1 text-red-400 hover:text-red-300 rounded"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-[280px] h-full flex flex-col border-r border-white/5 bg-slate-900/60 backdrop-blur-2xl flex-shrink-0 overflow-hidden">
      {/* Sidebar Header */}
      <div className="h-14 flex items-center px-4 justify-between border-b border-white/5">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-teal-500/10 flex items-center justify-center border border-teal-500/25">
            <Compass className="w-4 h-4 text-teal-400" />
          </div>
          <span className="text-sm font-bold tracking-wider bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent">
            AETHER CONSOLE
          </span>
        </Link>
      </div>

      {/* Action Trigger */}
      <div className="p-3">
        <button
          onClick={createNewChat}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold text-slate-950 bg-teal-400 hover:bg-teal-500 active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4" />
          New Conversation
        </button>
      </div>

      {/* Main Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
        {/* Chats History */}
        <div className="space-y-4">
          <h3 className="text-[10px] uppercase font-bold tracking-wider text-slate-500 px-2">
            Conversations
          </h3>

          <div className="space-y-1">
            {conversations.length === 0 && (
              <p className="text-[11px] text-slate-600 px-2 py-4">No active conversations found.</p>
            )}

            {groupedConversations.today.length > 0 && (
              <div className="space-y-1">
                <span className="text-[9px] text-slate-600 font-semibold px-2 block pt-2">Today</span>
                {groupedConversations.today.map(renderChatItem)}
              </div>
            )}

            {groupedConversations.yesterday.length > 0 && (
              <div className="space-y-1">
                <span className="text-[9px] text-slate-600 font-semibold px-2 block pt-2">Yesterday</span>
                {groupedConversations.yesterday.map(renderChatItem)}
              </div>
            )}

            {groupedConversations.lastWeek.length > 0 && (
              <div className="space-y-1">
                <span className="text-[9px] text-slate-600 font-semibold px-2 block pt-2">Last Week</span>
                {groupedConversations.lastWeek.map(renderChatItem)}
              </div>
            )}

            {groupedConversations.older.length > 0 && (
              <div className="space-y-1">
                <span className="text-[9px] text-slate-600 font-semibold px-2 block pt-2">Older</span>
                {groupedConversations.older.map(renderChatItem)}
              </div>
            )}
          </div>
        </div>

        {/* Diagnostics & Operations */}
        <div className="space-y-2.5">
          <h3 className="text-[10px] uppercase font-bold tracking-wider text-slate-500 px-2">
            Diagnostics
          </h3>
          <div className="space-y-1">
            <Link
              to="/graph"
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                location.pathname === "/graph"
                  ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                  : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-200"
              }`}
            >
              <GitMerge className="w-3.5 h-3.5 flex-shrink-0" />
              Knowledge Graph
            </Link>

            <Link
              to="/logs"
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                location.pathname === "/logs"
                  ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                  : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-200"
              }`}
            >
              <Terminal className="w-3.5 h-3.5 flex-shrink-0" />
              Engine Logs
            </Link>

            <Link
              to="/settings"
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                location.pathname === "/settings"
                  ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                  : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-200"
              }`}
            >
              <SettingsIcon className="w-3.5 h-3.5 flex-shrink-0" />
              Console Settings
            </Link>
          </div>
        </div>
      </div>

      {/* Health Panel indicator (always at bottom) */}
      <HealthIndicator
        isOnline={isOnline}
        model={model}
        environment={environment}
      />
    </div>
  );
}
