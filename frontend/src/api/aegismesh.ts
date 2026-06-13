import type { MeshContext, RunRequest } from "../types/mesh";

const BASE_URL = "http://localhost:8000";

export async function runMesh(request: RunRequest): Promise<MeshContext> {
  const res = await fetch(`${BASE_URL}/api/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Mesh run failed (${res.status}): ${text}`);
  }
  return res.json();
}
