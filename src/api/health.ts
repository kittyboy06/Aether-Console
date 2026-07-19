import type { TelemetryLog } from "../types";

const API_BASE = import.meta.env.VITE_AETHER_API || "https://bakedpotato.tailb944f3.ts.net";

export interface HealthStatus {
  worker: string;
  database: string;
  modelRouter: string;
  activeWebSockets: number;
  stats: {
    runningWorkflows: number;
    knowledgeNodes: number;
    goalsCount: number;
    toolExecutions: number;
    pendingApprovals: number;
  };
}

export async function fetchHealthSnapshot(): Promise<HealthStatus> {
  const response = await fetch(`${API_BASE}/api/v1/health`);
  if (!response.ok) throw new Error(`Failed to fetch health status: ${response.statusText}`);
  return response.json();
}

export async function fetchTelemetryLogs(): Promise<TelemetryLog[]> {
  const response = await fetch(`${API_BASE}/api/v1/telemetry`);
  if (!response.ok) throw new Error(`Failed to fetch telemetry logs: ${response.statusText}`);
  return response.json();
}
