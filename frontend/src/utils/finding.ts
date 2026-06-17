import type { AuditCritique } from "../types/mesh";

export function countFindings(auditHistory: AuditCritique[] | undefined): Record<string, number> {
  const counts: Record<string, number> = {
    VERIFIED_EXPLOIT: 0,
    SPECULATIVE_RISK: 0,
    INFORMATIONAL: 0,
  };
  if (!auditHistory) return counts;
  for (const a of auditHistory) {
    if (a.finding_type in counts) {
      counts[a.finding_type]++;
    }
  }
  return counts;
}
