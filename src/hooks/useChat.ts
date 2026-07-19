import { useState, useEffect, useCallback, useRef } from "react";
import type { Conversation, Message } from "../types";
import { sendChatMessage, updateModelRoute, fetchDiscoveredModels } from "../api/chat";
import {
  fetchConversations,
  fetchConversationHistory,
  renameConversation as apiRenameConversation,
  deleteConversation as apiDeleteConversation,
} from "../api/conversations";
import { useSync } from "./useSync";
import type { SyncItem } from "./useSync";

export function useChat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isNewConversationRef = useRef(false);

  // Router configurations (can be overridden by Developer Toolbar)
  const [provider, setProviderState] = useState<string>(() => localStorage.getItem("aether_dev_provider") || "google");
  const [model, setModelState] = useState<string>(() => localStorage.getItem("aether_dev_model") || "gemini-1.5-flash");
  const [environment, setEnvironment] = useState<string>(() => localStorage.getItem("aether_dev_env") || "Live");
  const [discoveredModels, setDiscoveredModels] = useState<Array<{
    provider: string;
    model_id: string;
    model_name: string;
  }>>([]);

  // Use ref to break the dependency cycle with handleSyncSuccess
  const loadConversationsRef = useRef<(() => Promise<void>) | undefined>(undefined);

  // Sync callbacks: when an offline item successfully syncs with the server
  const handleSyncSuccess = useCallback((item: SyncItem, response?: any) => {
    if (item.type === "send-message") {
      const { tempMessageId } = item.payload;
      
      // Update the temporary pending message with the real response
      if (response?.message) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempMessageId
              ? {
                  id: response.message.id,
                  role: "assistant",
                  content: response.message.content,
                  timestamp: response.message.timestamp,
                  reasoning: response.reasoning,
                  pending: false,
                }
              : msg
          )
        );
      }
      
      // Refresh conversation list via ref
      loadConversationsRef.current?.();
    }
  }, []);

  const { isOnline, addToQueue } = useSync(handleSyncSuccess);

  // Load conversations list
  const loadConversations = useCallback(async () => {
    try {
      if (!isOnline) {
        // Fallback: load from cache
        const cached = localStorage.getItem("aether_conversations_cache");
        if (cached) setConversations(JSON.parse(cached));
        return;
      }
      const data = await fetchConversations();
      setConversations(data);
      localStorage.setItem("aether_conversations_cache", JSON.stringify(data));
    } catch (err) {
      console.warn("Failed to fetch conversations, checking cache", err);
      const cached = localStorage.getItem("aether_conversations_cache");
      if (cached) setConversations(JSON.parse(cached));
    }
  }, [isOnline]);

  // Keep the ref updated with the latest loadConversations instance
  useEffect(() => {
    loadConversationsRef.current = loadConversations;
  }, [loadConversations]);

  // Load message history for specific conversation
  const loadHistory = useCallback(async (convId: string) => {
    if (!convId) return;
    setIsLoading(true);
    setError(null);
    try {
      if (!isOnline) {
        // Fallback: load messages from cache
        const cached = localStorage.getItem(`aether_messages_cache_${convId}`);
        if (cached) setMessages(JSON.parse(cached));
        setIsLoading(false);
        return;
      }
      const data = await fetchConversationHistory(convId);
      setMessages(data);
      localStorage.setItem(`aether_messages_cache_${convId}`, JSON.stringify(data));
    } catch (err) {
      console.warn("Failed to fetch conversation history, checking cache", err);
      const cached = localStorage.getItem(`aether_messages_cache_${convId}`);
      if (cached) setMessages(JSON.parse(cached));
    } finally {
      setIsLoading(false);
    }
  }, [isOnline]);

  const setModel = useCallback(async (newModel: string) => {
    setModelState(newModel);
    localStorage.setItem("aether_dev_model", newModel);
    
    let resolvedProvider = provider;
    if (newModel.toLowerCase().includes("nemotron")) {
      resolvedProvider = "openrouter";
      setProviderState("openrouter");
      localStorage.setItem("aether_dev_provider", "openrouter");
    } else {
      resolvedProvider = "google";
      setProviderState("google");
      localStorage.setItem("aether_dev_provider", "google");
    }

    try {
      const stages = ["chat", "reasoner", "planner", "reflector", "identity"];
      await Promise.all(
        stages.map((stage) => updateModelRoute(stage, resolvedProvider, newModel))
      );
    } catch (err) {
      console.warn("Failed to propagate model route update to backend:", err);
    }
  }, [provider, isOnline]);

  const setProvider = useCallback(async (newProvider: string) => {
    setProviderState(newProvider);
    localStorage.setItem("aether_dev_provider", newProvider);

    try {
      const stages = ["chat", "reasoner", "planner", "reflector", "identity"];
      await Promise.all(
        stages.map((stage) => updateModelRoute(stage, newProvider, model))
      );
    } catch (err) {
      console.warn("Failed to propagate provider route update to backend:", err);
    }
  }, [model, isOnline]);

  useEffect(() => {
    localStorage.setItem("aether_dev_env", environment);
  }, [environment]);

  // Load discovered models on mount and network updates
  useEffect(() => {
    async function loadModels() {
      try {
        const data = await fetchDiscoveredModels();
        const filtered = data
          .map((m) => {
            // Map the unusable/non-existent 2.5 names to actual 1.5 working models
            if (m.model_id === "gemini-2.5-flash") {
              return { ...m, model_id: "gemini-1.5-flash", model_name: "Gemini 1.5 Flash" };
            }
            if (m.model_id === "gemini-2.5-pro") {
              return { ...m, model_id: "gemini-1.5-pro", model_name: "Gemini 1.5 Pro" };
            }
            return m;
          })
          .filter((m) => {
            const modelId = m.model_id.toLowerCase();
            const mProvider = m.provider.toLowerCase();
            
            // Remove completely unusable models (e.g. invalid name 2.5 or Claude which is not registered/active in reasoning engine)
            if (modelId.includes("gemini-2.5")) return false;
            if (modelId.includes("claude")) return false;

            const isGoogle = mProvider === "google" && (modelId.startsWith("gemini-1.5") || modelId.startsWith("gemini-2.0") || modelId.includes("gemini-embedding"));
            const isNvidia = (mProvider === "nvidia" || mProvider === "openrouter") && modelId.includes("nemotron");

            return isGoogle || isNvidia;
          });

        // Deduplicate
        const unique: typeof filtered = [];
        const seenIds = new Set<string>();
        filtered.forEach((m) => {
          if (!seenIds.has(m.model_id)) {
            seenIds.add(m.model_id);
            unique.push(m);
          }
        });

        if (unique.length > 0) {
          setDiscoveredModels(unique);
        } else {
          throw new Error("No front tier models in discovery response.");
        }
      } catch (err) {
        console.warn("Discovered models sync failure. Falling back to default list.", err);
        setDiscoveredModels([
          { provider: "google", model_id: "gemini-1.5-flash", model_name: "Gemini 1.5 Flash" },
          { provider: "google", model_id: "gemini-1.5-pro", model_name: "Gemini 1.5 Pro" },
          { provider: "openrouter", model_id: "nvidia/nemotron-3-super-120b-a12b", model_name: "Nemotron 3 Super" },
        ]);
      }
    }

    if (isOnline) {
      loadModels();
    } else {
      setDiscoveredModels([
        { provider: "google", model_id: "gemini-1.5-flash", model_name: "Gemini 1.5 Flash" },
        { provider: "google", model_id: "gemini-1.5-pro", model_name: "Gemini 1.5 Pro" },
        { provider: "openrouter", model_id: "nvidia/nemotron-3-super-120b-a12b", model_name: "Nemotron 3 Super" },
      ]);
    }
  }, [isOnline]);

  // Handle switching active conversations
  useEffect(() => {
    if (currentId) {
      if (isNewConversationRef.current) {
        isNewConversationRef.current = false;
      } else {
        loadHistory(currentId);
      }
    } else {
      setMessages([]);
    }
  }, [currentId, loadHistory]);

  // Initial load
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Send Message
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    // Resolve or generate conversation ID if starting fresh
    let resolvedId = currentId;
    if (!resolvedId) {
      resolvedId = crypto.randomUUID();
      isNewConversationRef.current = true;
      setCurrentId(resolvedId);
      
      const newConv: Conversation = {
        id: resolvedId,
        title: text.length > 30 ? text.slice(0, 30) + "..." : text,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setConversations((prev) => [newConv, ...prev]);
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
      pending: false,
    };

    const assistantPendingMessage: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString(),
      pending: true,
    };

    // Update screen optimistically
    const updatedMessages = [...messages, userMessage, assistantPendingMessage];
    setMessages(updatedMessages);
    localStorage.setItem(`aether_messages_cache_${resolvedId}`, JSON.stringify(updatedMessages));

    if (!isOnline) {
      // Queue message sync for later
      addToQueue("send-message", {
        message: text,
        conversationId: resolvedId,
        provider,
        model,
        tempMessageId: assistantPendingMessage.id,
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await sendChatMessage(text, resolvedId, provider, model);
      
      const finalAssistantMessage: Message = {
        id: response.message.id,
        role: "assistant",
        content: response.message.content,
        timestamp: response.message.timestamp,
        reasoning: response.reasoning,
        pending: false,
      };

      setMessages((prev) => {
        const next = prev.map((msg) =>
          msg.id === assistantPendingMessage.id ? finalAssistantMessage : msg
        );
        localStorage.setItem(`aether_messages_cache_${resolvedId}`, JSON.stringify(next));
        return next;
      });
      
      // Reload list to capture name or activity updates
      loadConversations();
    } catch (err: any) {
      console.error("Failed to send message", err);
      // Mark as error
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantPendingMessage.id
            ? { ...msg, pending: false, error: true, content: "Failed to receive response from Aether. Please verify API connection." }
            : msg
        )
      );
      setError("API Connection failure: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }, [currentId, messages, provider, model, isOnline, addToQueue, loadConversations]);

  // Create new conversation
  const createNewChat = useCallback(() => {
    setCurrentId(null);
    setMessages([]);
    setError(null);
  }, []);

  // Rename Conversation
  const renameChat = useCallback(async (convId: string, title: string) => {
    // Optimistic UI
    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, title } : c))
    );

    if (!isOnline) {
      addToQueue("rename-conversation", { conversationId: convId, title });
      return;
    }

    try {
      await apiRenameConversation(convId, title);
      loadConversations();
    } catch (err) {
      console.warn("Failed to rename, queueing offline", err);
      addToQueue("rename-conversation", { conversationId: convId, title });
    }
  }, [isOnline, addToQueue, loadConversations]);

  // Delete Conversation
  const deleteChat = useCallback(async (convId: string) => {
    // Optimistic UI
    setConversations((prev) => prev.filter((c) => c.id !== convId));
    if (currentId === convId) {
      createNewChat();
    }

    if (!isOnline) {
      addToQueue("delete-conversation", { conversationId: convId });
      return;
    }

    try {
      await apiDeleteConversation(convId);
      loadConversations();
    } catch (err) {
      console.warn("Failed to delete, queueing offline", err);
      addToQueue("delete-conversation", { conversationId: convId });
    }
  }, [currentId, isOnline, addToQueue, createNewChat, loadConversations]);

  return {
    conversations,
    currentId,
    setCurrentId,
    messages,
    isLoading,
    error,
    provider,
    setProvider,
    model,
    setModel,
    environment,
    setEnvironment,
    isOnline,
    sendMessage,
    createNewChat,
    renameChat,
    deleteChat,
    discoveredModels,
  };
}
