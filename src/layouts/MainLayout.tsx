import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { Menu } from "lucide-react";

interface MainLayoutProps {
  conversations: any[];
  currentId: string | null;
  setCurrentId: (id: string | null) => void;
  createNewChat: () => void;
  renameChat: (id: string, title: string) => void;
  deleteChat: (id: string) => void;
  isOnline: boolean;
  model: string;
  environment: string;
}

export default function MainLayout({
  conversations,
  currentId,
  setCurrentId,
  createNewChat,
  renameChat,
  deleteChat,
  isOnline,
  model,
  environment,
}: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans relative">
      {/* Mobile Top Navigation Header */}
      <header className="h-14 border-b border-white/5 bg-slate-900/40 backdrop-blur-md flex items-center justify-between px-4 select-none md:hidden z-20 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-1.5 hover:bg-slate-800/60 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-sm font-bold tracking-wider bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent">
            AETHER CONSOLE
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">{environment}</span>
          <div 
            className={`w-2 h-2 rounded-full ${isOnline ? "bg-teal-400" : "bg-red-400"} animate-pulse`} 
            title={isOnline ? "Online" : "Offline"}
          />
        </div>
      </header>

      {/* Mobile Sidebar overlay backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar drawer wrapper */}
      <div
        className={`fixed inset-y-0 left-0 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out z-40 md:relative md:translate-x-0 w-[280px] h-full flex-shrink-0`}
      >
        <Sidebar
          conversations={conversations}
          currentId={currentId}
          setCurrentId={(id) => {
            setCurrentId(id);
            setIsSidebarOpen(false);
          }}
          createNewChat={() => {
            createNewChat();
            setIsSidebarOpen(false);
          }}
          renameChat={renameChat}
          deleteChat={deleteChat}
          isOnline={isOnline}
          model={model}
          environment={environment}
        />
      </div>

      {/* Main Panel Content */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        <Outlet />
      </div>
    </div>
  );
}
