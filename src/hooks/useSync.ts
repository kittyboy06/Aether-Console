import { useState, useEffect, useCallback } from "react";

export interface SyncItem {
  id: string;
  type: "send-message" | "rename-conversation" | "delete-conversation" | "create-conversation";
  payload: any;
  timestamp: number;
}

export function useSync(onSyncSuccess?: (item: SyncItem, response?: any) => void) {
  const [queue, setQueue] = useState<SyncItem[]>(() => {
    try {
      const stored = localStorage.getItem("aether_sync_queue");
      return stored ? JSON.parse(stored) : [];
    } catch (_) {
      return [];
    }
  });

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const saveQueue = useCallback((newQueue: SyncItem[]) => {
    setQueue(newQueue);
    localStorage.setItem("aether_sync_queue", JSON.stringify(newQueue));
  }, []);

  const addToQueue = useCallback((type: SyncItem["type"], payload: any) => {
    const item: SyncItem = {
      id: crypto.randomUUID(),
      type,
      payload,
      timestamp: Date.now(),
    };
    saveQueue([...queue, item]);
    return item;
  }, [queue, saveQueue]);

  const removeFromQueue = useCallback((id: string) => {
    saveQueue(queue.filter((item) => item.id !== id));
  }, [queue, saveQueue]);

  // Synchronize the queue with the backend
  const syncQueue = useCallback(async () => {
    if (queue.length === 0 || !isOnline) return;

    // Process one item at a time in order
    const nextItem = queue[0];
    const API_BASE = import.meta.env.VITE_AETHER_API || "https://bakedpotato.tailb944f3.ts.net";

    try {
      let resData: any = null;

      if (nextItem.type === "send-message") {
        const { message, conversationId, provider, model } = nextItem.payload;
        const res = await fetch(`${API_BASE}/api/v1/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message, conversationId, provider, model }),
        });
        if (!res.ok) throw new Error("Sync failed");
        resData = await res.json();
      } else if (nextItem.type === "rename-conversation") {
        const { conversationId, title } = nextItem.payload;
        const res = await fetch(`${API_BASE}/api/v1/conversations/${conversationId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title }),
        });
        if (!res.ok) throw new Error("Sync failed");
      } else if (nextItem.type === "delete-conversation") {
        const { conversationId } = nextItem.payload;
        const res = await fetch(`${API_BASE}/api/v1/conversations/${conversationId}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Sync failed");
      }

      // Trigger success callback
      if (onSyncSuccess) {
        onSyncSuccess(nextItem, resData);
      }

      // Remove from state and local storage, then proceed with the rest of the queue
      removeFromQueue(nextItem.id);
    } catch (error) {
      console.warn("Offline sync failed for item:", nextItem.id, error);
      // Wait before retrying
    }
  }, [queue, isOnline, onSyncSuccess, removeFromQueue]);

  // Run synchronization loop
  useEffect(() => {
    if (isOnline && queue.length > 0) {
      const timer = setTimeout(() => {
        syncQueue();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [queue, isOnline, syncQueue]);

  return {
    isOnline,
    queue,
    addToQueue,
    removeFromQueue,
    syncQueue,
  };
}
