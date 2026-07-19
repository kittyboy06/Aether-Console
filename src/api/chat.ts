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

export async function updateModelRoute(
  routeKey: string,
  provider: string,
  model: string,
  policy?: string
): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE}/api/v1/routing/update`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ routeKey, provider, model, policy }),
  });
  if (!response.ok) {
    throw new Error(`Failed to update routing: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchDiscoveredModels(): Promise<Array<{
  provider: string;
  model_id: string;
  model_name: string;
}>> {
  const response = await fetch(`${API_BASE}/api/v1/models/discovery`);
  if (!response.ok) {
    throw new Error(`Failed to fetch discovered models: ${response.statusText}`);
  }
  return response.json();
}
