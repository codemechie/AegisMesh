import type { MeshContext, RunRequest, HealthResponse } from "../types/mesh";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const TIMEOUT_MS = 120_000;

export async function checkHealth(): Promise<HealthResponse> {
  const res = await fetch(`${BASE_URL}/api/health`, { method: "GET" });
  if (!res.ok) {
    throw new Error(`Health check failed (${res.status})`);
  }
  return res.json();
}

export async function runMesh(request: RunRequest): Promise<MeshContext> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/api/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeout);
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error(
        "Backend request timed out after 120 seconds. The mesh may still be processing — check the transcript if the session was created."
      );
    }
    throw new Error(
      "Cannot reach the AegisMesh backend. Ensure the API server is running and VITE_API_URL is set correctly."
    );
  }

  clearTimeout(timeout);

  if (!res.ok) {
    const text = await res.text();
    const summary = text.length > 200 ? text.slice(0, 200) + "..." : text;
    throw new Error(`Mesh run failed (${res.status}): ${summary}`);
  }

  return res.json();
}
