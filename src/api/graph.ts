import type { GraphSnapshot, GoalSnapshot } from "../types";

const API_BASE = import.meta.env.VITE_AETHER_API || "https://bakedpotato.tailb944f3.ts.net";

export async function fetchGraphSnapshot(): Promise<GraphSnapshot> {
  const response = await fetch(`${API_BASE}/api/v1/graph`);
  if (!response.ok) throw new Error(`Failed to fetch graph snapshot: ${response.statusText}`);
  return response.json();
}

export async function fetchGoalsSnapshot(): Promise<GoalSnapshot[]> {
  const response = await fetch(`${API_BASE}/api/v1/goals`);
  if (!response.ok) throw new Error(`Failed to fetch goals snapshot: ${response.statusText}`);
  return response.json();
}
