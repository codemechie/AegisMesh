import type { FC } from "react";

const STATUS_STYLES: Record<string, string> = {
  SECURED: "bg-green-900/50 text-green-300 border-green-700",
  PATCH_REJECTED: "bg-red-900/50 text-red-300 border-red-700",
  ESCALATION_REQUIRED: "bg-orange-900/50 text-orange-300 border-orange-700",
};

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: FC<StatusBadgeProps> = ({ status }) => {
  const cls = STATUS_STYLES[status] ?? "bg-[#1f2937] text-[#9ca3af] border-[#374151]";
  return (
    <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${cls}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
};

export default StatusBadge;
