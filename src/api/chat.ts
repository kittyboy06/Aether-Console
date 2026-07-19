const API_BASE = import.meta.env.VITE_AETHER_API || "https://bakedpotato.tailb944f3.ts.net";

export async function sendChatMessage(
  message: string,
  conversationId: string,
  provider?: string,
  model?: string
): Promise<{
  message: { id: string; role: "assistant"; content: string; timestamp: string };
  sessionId: string;
  conversationId: string;
  processingTime: number;
  reasoning?: any;
}> {
  const response = await fetch(`${API_BASE}/api/v1/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      conversationId,
      provider,
      model,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP ${response.status}`);
  }

  return response.json();
}
