import type { FC } from "react";
import type { MeshContext } from "../types/mesh";

interface SecurityConvergenceProps {
  ctx?: MeshContext;
  onViewFindings?: (type: string) => void;
}

const FT_COLORS: Record<string, string> = {
  VERIFIED_EXPLOIT: "bg-red-900/60 text-red-400",
  SPECULATIVE_RISK: "bg-yellow-900/60 text-yellow-400",
  INFORMATIONAL: "bg-blue-900/60 text-blue-400",
};

const SecurityConvergence: FC<SecurityConvergenceProps> = ({ ctx, onViewFindings }) => {
  if (!ctx || ctx.audit_history.length === 0) {
    return (
      <div className="rounded-lg border border-[#1f2937] bg-[#111827] p-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#9ca3af]">
          Convergence
        </span>
        <p className="mt-1 text-xs text-[#6b7280]">No convergence data available.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[#1f2937] bg-[#111827] p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#9ca3af]">
          Convergence
        </span>
        {ctx.active_models?.red && (
          <span className="inline-flex items-center gap-1 rounded border border-red-900/50 bg-red-900/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-red-400">
            <span>RED</span>
            <span className="font-normal normal-case text-[#9ca3af]">
              {ctx.active_models.red.split("/").pop() ?? ""}
            </span>
          </span>
        )}
      </div>

      <div className="space-y-1">
        {ctx.audit_history.map((entry, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onViewFindings?.(entry.finding_type)}
            className="flex w-full items-center justify-between rounded bg-[#0a0f1a] px-2.5 py-1.5 transition-colors hover:bg-[#1f2937]"
          >
            <span className="text-xs text-[#f3f4f6]">Iteration {i + 1}</span>
            <div className="flex items-center gap-2">
              {entry.evidence.length > 0 && (
                <span className="text-[10px] text-[#6b7280]">
                  {entry.evidence.length} ev
                </span>
              )}
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                  FT_COLORS[entry.finding_type] ?? "bg-gray-900/60 text-gray-400"
                }`}
              >
                {entry.finding_type}
              </span>
            </div>
          </button>
        ))}
      </div>

      <div
        className={`mt-2 rounded px-2.5 py-1 text-center text-xs font-bold tracking-wider ${
          ctx.status === "SECURED"
            ? "bg-green-900/60 text-green-400"
            : ctx.status === "PATCH_REJECTED"
              ? "bg-red-900/60 text-red-400"
              : ctx.status === "ESCALATION_REQUIRED"
                ? "bg-orange-900/60 text-orange-400"
                : "bg-[#1f2937] text-[#9ca3af]"
        }`}
      >
        {ctx.status === "SECURED" ? "\u2713 " : ""}
        {ctx.status}
      </div>
    </div>
  );
};

export default SecurityConvergence;
