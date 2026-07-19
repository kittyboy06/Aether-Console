import { useState, useEffect, useCallback, useRef } from "react";
import type { Conversation, Message } from "../types";
import { sendChatMessage } from "../api/chat";
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
  const [provider, setProvider] = useState<string>(() => localStorage.getItem("aether_dev_provider") || "google");
  const [model, setModel] = useState<string>(() => localStorage.getItem("aether_dev_model") || "gemini-2.5-flash");
  const [environment, setEnvironment] = useState<string>(() => localStorage.getItem("aether_dev_env") || "Live");

  useEffect(() => {
    localStorage.setItem("aether_dev_provider", provider);
  }, [provider]);

  useEffect(() => {
    localStorage.setItem("aether_dev_model", model);
  }, [model]);

  useEffect(() => {
    localStorage.setItem("aether_dev_env", environment);
  }, [environment]);

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
      
      // Refresh conversation list
      loadConversations();
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
  };
}
