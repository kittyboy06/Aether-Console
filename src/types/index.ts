export interface ReasoningDetails {
  provider: string;
  model: string;
  latency: number; // in seconds
  confidence: number; // e.g., 0.93
  retrievedMemories: number;
  updatedNodes: number;
  toolCalls: string[];
  promptTokens?: number;
  completionTokens?: number;
  totalCost?: number;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  reasoning?: ReasoningDetails | null;
  pending?: boolean;
  error?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServerHealth {
  status: "connected" | "offline";
  latency: number; // ms
  memoryNodes: number;
  model: string;
  environment: string; // e.g., "Live", "Local"
}

export interface GraphNode {
  id: string;
  type: string;
  name: string;
  memoryTier: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: string;
}

export interface GraphSnapshot {
  version: number;
  tiers: {
    active: number;
    cold: number;
    archived: number;
  };
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface GoalSnapshot {
  id: string;
  title: string;
  status: string;
  health: string;
  progress: number;
}

export interface TelemetryLog {
  timestamp: string;
  type: "INFO" | "WARNING" | "ERROR";
  message: string;
}
