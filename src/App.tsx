import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useChat } from "./hooks/useChat";
import MainLayout from "./layouts/MainLayout";
import Chat from "./pages/Chat";
import GraphView from "./pages/GraphView";
import LogsView from "./pages/LogsView";
import Settings from "./pages/Settings";

export default function App() {
  const chatState = useChat();

  return (
    <BrowserRouter>
      <Routes>
        <Route
          element={
            <MainLayout
              conversations={chatState.conversations}
              currentId={chatState.currentId}
              setCurrentId={chatState.setCurrentId}
              createNewChat={chatState.createNewChat}
              renameChat={chatState.renameChat}
              deleteChat={chatState.deleteChat}
              isOnline={chatState.isOnline}
              model={chatState.model}
              environment={chatState.environment}
            />
          }
        >
          <Route
            path="/"
            element={
              <Chat
                messages={chatState.messages}
                isLoading={chatState.isLoading}
                error={chatState.error}
                sendMessage={chatState.sendMessage}
                setProvider={chatState.setProvider}
                model={chatState.model}
                setModel={chatState.setModel}
                environment={chatState.environment}
                setEnvironment={chatState.setEnvironment}
              />
            }
          />
          <Route path="/graph" element={<GraphView />} />
          <Route path="/logs" element={<LogsView />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
