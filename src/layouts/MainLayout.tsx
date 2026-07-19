import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

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
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        currentId={currentId}
        setCurrentId={setCurrentId}
        createNewChat={createNewChat}
        renameChat={renameChat}
        deleteChat={deleteChat}
        isOnline={isOnline}
        model={model}
        environment={environment}
      />

      {/* Main Panel Content */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        <Outlet />
      </div>
    </div>
  );
}
