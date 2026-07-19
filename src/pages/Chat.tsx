import ChatWindow from "../components/ChatWindow";
import ChatInput from "../components/ChatInput";
import DevToolbar from "../components/DevToolbar";

interface ChatPageProps {
  messages: any[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (text: string) => void;
  model: string;
  setModel: (m: string) => void;
  environment: string;
  setEnvironment: (e: string) => void;
  discoveredModels: any[];
}

export default function Chat({
  messages,
  isLoading,
  error,
  sendMessage,
  model,
  setModel,
  environment,
  setEnvironment,
  discoveredModels,
}: ChatPageProps) {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-900/40 relative">
      {/* Top Navigation / Developer Toolbar */}
      <DevToolbar
        model={model}
        setModel={setModel}
        environment={environment}
        setEnvironment={setEnvironment}
        discoveredModels={discoveredModels}
      />

      {/* Chat Window */}
      <div className="flex-1 overflow-hidden relative">
        <ChatWindow messages={messages} isLoading={isLoading} error={error} />
      </div>

      {/* Message Input Box */}
      <ChatInput onSend={sendMessage} isLoading={isLoading} />
    </div>
  );
}
