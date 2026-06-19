import { useState, useCallback, useEffect, type FC } from "react";
import type {
  AuditCritique,
  SecurityIntelligenceReport,
  EventRecord,
} from "../types/mesh";
import FindingBadge from "./shared/FindingBadge";
import ConfidenceBadge from "./shared/ConfidenceBadge";
import EvidenceList from "./shared/EvidenceList";

type FindingType = "VERIFIED_EXPLOIT" | "SPECULATIVE_RISK" | "INFORMATIONAL";

const FINDING_LABELS: Record<FindingType, { label: string; empty: string }> = {
  VERIFIED_EXPLOIT: {
    label: "Verified Exploits",
    empty: "No verified exploits identified.",
  },
  SPECULATIVE_RISK: {
    label: "Speculative Risks",
    empty: "No speculative risks identified.",
  },
  INFORMATIONAL: {
    label: "Informational Findings",
    empty: "No informational findings identified.",
  },
};

const FT_HEADER_BG: Record<FindingType, string> = {
  VERIFIED_EXPLOIT: "bg-red-900/20 border-red-700",
  SPECULATIVE_RISK: "bg-yellow-900/20 border-yellow-700",
  INFORMATIONAL: "bg-blue-900/20 border-blue-700",
};

const FT_HEADER_TEXT: Record<FindingType, string> = {
  VERIFIED_EXPLOIT: "text-red-400",
  SPECULATIVE_RISK: "text-yellow-400",
  INFORMATIONAL: "text-blue-400",
};

const FT_BORDER: Record<FindingType, string> = {
  VERIFIED_EXPLOIT: "border-red-900/50",
  SPECULATIVE_RISK: "border-yellow-900/50",
  INFORMATIONAL: "border-blue-900/50",
};

interface FindingDetailsModalProps {
  findings: AuditCritique[];
  filteredType: FindingType | null;
  onClose: () => void;
  securityReport?: SecurityIntelligenceReport | null;
  eventHistory?: EventRecord[];
  totalIterations?: number;
}

const FindingDetailsModal: FC<FindingDetailsModalProps> = ({
  findings,
  filteredType,
  onClose,
  securityReport,
  eventHistory,
  totalIterations,
}) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [reasoningOpen, setReasoningOpen] = useState(false);

  const current = findings[Math.min(selectedIdx, findings.length - 1)]!;

  const goPrev = useCallback(() => {
    setSelectedIdx((i) => Math.max(0, i - 1));
    setReasoningOpen(false);
  }, []);

  const goNext = useCallback(() => {
    setSelectedIdx((i) => Math.min(findings.length - 1, i + 1));
    setReasoningOpen(false);
  }, [findings.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose, goPrev, goNext]);

  if (findings.length === 0) {
    const label = filteredType ? FINDING_LABELS[filteredType] : { label: "Findings", empty: "No findings available." };
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="w-full max-w-lg rounded-xl border border-[#1f2937] bg-[#111827] shadow-2xl">
          <div className="flex items-center justify-between border-b border-[#1f2937] px-6 py-4">
            <h2 className="text-lg font-bold text-[#f3f4f6]">{label.label}</h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded p-1 text-[#6b7280] transition-colors hover:bg-[#1f2937] hover:text-[#f3f4f6]"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-[#9ca3af]">{label.empty}</p>
          </div>
        </div>
      </div>
    );
  }

  const ft = current.finding_type as FindingType;
  const headerBg = FT_HEADER_BG[ft] ?? "bg-gray-900/20 border-gray-700";
  const headerText = FT_HEADER_TEXT[ft] ?? "text-gray-400";
  const borderColor = FT_BORDER[ft] ?? "border-gray-900/50";
  const hasMultiple = findings.length > 1;

  const siRef = securityReport
    ? `This finding contributed to the final ${securityReport.risk_level} risk assessment (Score: ${securityReport.security_score}/100).`
    : null;

  const auditEvent = eventHistory?.find(
    (ev) =>
      ev.event_type === "AUDIT_COMPLETED" &&
      (ev.payload as Record<string, unknown>)?.critique &&
      ((ev.payload as Record<string, unknown>).critique as Record<string, unknown>)?.patch_id === current.patch_id
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="flex w-full max-w-2xl flex-col rounded-xl border border-[#1f2937] bg-[#111827] shadow-2xl max-h-[90vh]">
        {/* Header */}
        <div
          className={`flex items-center justify-between rounded-t-xl border-b px-6 py-4 ${headerBg}`}
        >
          <div className={`flex items-center gap-3 ${headerText}`}>
            <h2 className="text-lg font-bold tracking-tight">
              {filteredType ? FINDING_LABELS[filteredType].label : "Findings"}
            </h2>
            {hasMultiple && (
              <span className="text-sm font-medium text-[#9ca3af]">
                Finding {selectedIdx + 1} of {findings.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasMultiple && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={goPrev}
                  disabled={selectedIdx === 0}
                  className="rounded p-1 text-[#6b7280] transition-colors hover:bg-[#1f2937] hover:text-[#f3f4f6] disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  disabled={selectedIdx === findings.length - 1}
                  className="rounded p-1 text-[#6b7280] transition-colors hover:bg-[#1f2937] hover:text-[#f3f4f6] disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded p-1 text-[#6b7280] transition-colors hover:bg-[#1f2937] hover:text-[#f3f4f6]"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Findings Navigation Bar (horizontal list when multiple) */}
        {hasMultiple && (
          <div className="flex gap-1.5 overflow-x-auto border-b border-[#1f2937] px-4 py-2">
            {findings.map((f, i) => (
              <button
                key={i}
                type="button"
                onClick={() => { setSelectedIdx(i); setReasoningOpen(false); }}
                className={`shrink-0 rounded px-2 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                  i === selectedIdx
                    ? "bg-[#1f2937] text-[#f3f4f6]"
                    : "bg-[#0a0f1a] text-[#6b7280] hover:text-[#9ca3af]"
                }`}
              >
                {f.finding_type.replace(/_/g, " ")} #{i + 1}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className={`min-h-0 overflow-y-auto p-6 ${borderColor}`}>
          <div className="space-y-5">
            {/* Type & Confidence */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FindingBadge variant={current.finding_type} />
                <span className="text-xs text-[#6b7280]">Patch: {current.patch_id}</span>
              </div>
              <ConfidenceBadge confidence={current.confidence} />
            </div>

            {/* Agent & Iteration */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#6b7280]">
              <span className="inline-flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                Red Auditor Agent
              </span>
              {totalIterations != null && (
                <span>Iteration {selectedIdx + 1} of {totalIterations}</span>
              )}
              <span className={current.is_secure ? "text-green-400" : "text-red-400"}>
                {current.is_secure ? "Patch considered secure" : "Exploit detected"}
              </span>
            </div>

            {/* Attack Path — only for VERIFIED_EXPLOIT with a concrete exploit walkthrough */}
            {current.exploit_found && (
              <div>
                <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#9ca3af]">
                  Attack Paths Evaluated
                </h4>
                <div className="rounded-lg border border-[#1f2937] bg-[#0a0f1a] px-3 py-2">
                  <p className="text-sm leading-relaxed text-[#d1d5db] whitespace-pre-line">
                    {current.exploit_found}
                  </p>
                </div>
              </div>
            )}

            {/* Evidence */}
            <div>
              <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#9ca3af]">
                Evidence
              </h4>
              <EvidenceList evidence={current.evidence} />
            </div>

            {/* Security Intelligence Reference */}
            {siRef && securityReport && (
              <div className="rounded-lg border border-purple-900/30 bg-[#1a0a2e] px-3 py-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-purple-400">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Referenced By Security Intelligence
                </div>
                <p className="mt-1 text-sm text-[#d1d5db]">{siRef}</p>
              </div>
            )}

            {/* Audit Reasoning (Collapsible) */}
            {current.graph_of_thoughts && current.graph_of_thoughts.length > 0 && (
              <div className="rounded-lg border border-[#1f2937]">
                <button
                  type="button"
                  onClick={() => setReasoningOpen((v) => !v)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#9ca3af] hover:text-[#f3f4f6]"
                >
                  <span>Audit Reasoning</span>
                  <span
                    className={`transition-transform duration-200 ${
                      reasoningOpen ? "rotate-180" : ""
                    }`}
                  >
                    {"\u25BC"}
                  </span>
                </button>
                {reasoningOpen && (
                  <div className="border-t border-[#1f2937] px-4 py-3">
                    <div className="space-y-2">
                      {current.graph_of_thoughts.map((thought) => (
                        <div
                          key={thought.thought_id}
                          className="rounded-lg border border-[#1f2937] bg-[#0a0f1a] px-3 py-2"
                        >
                          <div className="mb-0.5 flex items-center gap-2">
                            <span className="text-[10px] font-mono text-[#6b7280]">
                              {thought.thought_id}
                            </span>
                            {thought.parent_thoughts.length > 0 && (
                              <span className="text-[10px] text-[#4b5563]">
                                parents: {thought.parent_thoughts.join(", ")}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-[#d1d5db]">{thought.hypothesis}</p>
                          <p className="mt-0.5 text-xs text-[#9ca3af]">{thought.evaluation_result}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Audit Event Context */}
            {auditEvent && (
              <div className="rounded-lg border border-[#1f2937] bg-[#0a0f1a] px-3 py-2">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[#6b7280]">
                  Audit Event
                </div>
                <p className="mt-0.5 font-mono text-xs text-[#9ca3af]">
                  {auditEvent.event_id} &middot; {new Date(auditEvent.timestamp).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindingDetailsModal;
