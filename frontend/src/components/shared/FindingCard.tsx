import type { FC } from "react";
import type { AuditCritique } from "../../types/mesh";
import FindingBadge from "./FindingBadge";
import ConfidenceBadge from "./ConfidenceBadge";

interface FindingCardProps {
  audit: AuditCritique;
  iteration: number;
  selected?: boolean;
  onSelect?: () => void;
}

const FindingCard: FC<FindingCardProps> = ({ audit, iteration, selected, onSelect }) => (
  <button
    type="button"
    onClick={onSelect}
    className={`w-full rounded-lg border px-3 py-2.5 text-left transition-colors ${
      selected
        ? "border-[#3b82f6] bg-[#0a1628]"
        : "border-[#1f2937] bg-[#0a0f1a] hover:border-[#4b5563]"
    }`}
  >
    <div className="flex items-center justify-between gap-2">
      <FindingBadge variant={audit.finding_type} />
      <ConfidenceBadge confidence={audit.confidence} />
    </div>
    <div className="mt-1.5 flex items-center gap-2 text-xs text-[#6b7280]">
      <span>Iteration {iteration}</span>
      <span>&middot;</span>
      <span>Red Auditor Agent</span>
      {audit.evidence.length > 0 && (
        <>
          <span>&middot;</span>
          <span>{audit.evidence.length} evidence item{audit.evidence.length !== 1 ? "s" : ""}</span>
        </>
      )}
    </div>
    {audit.exploit_found && (
      <p className="mt-1 line-clamp-2 text-sm text-[#d1d5db]">{audit.exploit_found}</p>
    )}
  </button>
);

export default FindingCard;
