import type { Conversation, Message } from "../types";

const API_BASE = import.meta.env.VITE_AETHER_API || "https://bakedpotato.tailb944f3.ts.net";

export async function fetchConversations(): Promise<Conversation[]> {
  const response = await fetch(`${API_BASE}/api/v1/conversations`);
  if (!response.ok) throw new Error(`Failed to fetch conversations: ${response.statusText}`);
  return response.json();
}

export async function fetchConversationHistory(conversationId: string): Promise<Message[]> {
  const response = await fetch(`${API_BASE}/api/v1/conversations/${conversationId}`);
  if (!response.ok) throw new Error(`Failed to fetch chat history: ${response.statusText}`);
  return response.json();
}

export async function renameConversation(conversationId: string, title: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/v1/conversations/${conversationId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!response.ok) throw new Error(`Failed to rename conversation: ${response.statusText}`);
}

export async function deleteConversation(conversationId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/v1/conversations/${conversationId}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error(`Failed to delete conversation: ${response.statusText}`);
}
