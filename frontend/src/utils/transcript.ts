import type { EventRecord } from "../types/mesh";

export function extractMessage(event: EventRecord): string {
  const p = event.payload;
  if (typeof p.message === "string" && p.message) return p.message;
  if (typeof p.summary === "string" && p.summary) return p.summary;
  if (typeof p.description === "string" && p.description) return p.description;
  if (typeof p.exploit_found === "string" && p.exploit_found) return p.exploit_found;
  if (typeof p.evaluation_result === "string" && p.evaluation_result) return p.evaluation_result;
  if (typeof p.reason === "string" && p.reason) return p.reason;
  if (typeof p.error === "string" && p.error) return `Error: ${p.error}`;
  if (typeof p.file_path === "string" && p.file_path) return `Target: ${p.file_path}`;
  return event.event_type.replace(/_/g, " ");
}

export type BadgeVariant = "VERIFIED_EXPLOIT" | "SPECULATIVE_RISK" | "INFORMATIONAL" | "SECURED" | "ESCALATION_REQUIRED";

export function extractFindingType(payload: Record<string, unknown>): BadgeVariant | null {
  const ft = payload.finding_type;
  if (ft === "VERIFIED_EXPLOIT" || ft === "SPECULATIVE_RISK" || ft === "INFORMATIONAL") {
    return ft as BadgeVariant;
  }
  if (payload.is_secure === true) return "SECURED";
  if (payload.deployment_recommendation === "ESCALATION_REQUIRED") return "ESCALATION_REQUIRED";
  return null;
}
