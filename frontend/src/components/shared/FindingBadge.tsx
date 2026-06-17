import type { FC } from "react";
import type { BadgeVariant } from "../../utils/transcript";

const FINDING_STYLES: Record<BadgeVariant, string> = {
  VERIFIED_EXPLOIT: "bg-red-900/70 text-red-300 border-red-700",
  SPECULATIVE_RISK: "bg-yellow-900/70 text-yellow-300 border-yellow-700",
  INFORMATIONAL: "bg-blue-900/70 text-blue-300 border-blue-700",
  SECURED: "bg-green-900/60 text-green-400 border-green-700",
  ESCALATION_REQUIRED: "bg-orange-900/60 text-orange-400 border-orange-700",
};

interface FindingBadgeProps {
  variant: BadgeVariant;
}

const FindingBadge: FC<FindingBadgeProps> = ({ variant }) => (
  <span className={`inline-flex rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${FINDING_STYLES[variant]}`}>
    {variant.replace(/_/g, " ")}
  </span>
);

export default FindingBadge;
