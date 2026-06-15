import type { FC } from "react";
import type { MeshContext } from "../types/mesh";

interface SecurityConvergenceProps {
  ctx?: MeshContext;
}

const SecurityConvergence: FC<SecurityConvergenceProps> = ({ ctx }) => {
  if (!ctx || ctx.audit_history.length === 0) {
    return (
      <div className="rounded-xl border border-[#1f2937] bg-[#111827] p-6 shadow-lg">
        <h3 className="mb-2 font-semibold text-[#f3f4f6]">
          Security Convergence
        </h3>
        <p className="text-sm text-[#9ca3af]">
          No convergence data available.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#1f2937] bg-[#111827] p-6 shadow-lg">
      <h3 className="mb-4 font-semibold text-[#f3f4f6]">
        Security Convergence
      </h3>

      <div className="space-y-2">
        {ctx.audit_history.map((entry, i) => {
          const ftColor =
            entry.finding_type === "VERIFIED_EXPLOIT"
              ? "bg-red-900/60 text-red-400 border-red-900/50"
              : entry.finding_type === "SPECULATIVE_RISK"
                ? "bg-yellow-900/60 text-yellow-400 border-yellow-900/50"
                : "bg-blue-900/60 text-blue-400 border-blue-900/50";
          const borderColor =
            entry.finding_type === "VERIFIED_EXPLOIT"
              ? "rgba(220, 38, 38, 0.3)"
              : entry.finding_type === "SPECULATIVE_RISK"
                ? "rgba(234, 179, 8, 0.3)"
                : "rgba(59, 130, 246, 0.3)";
          const bgColor =
            entry.finding_type === "VERIFIED_EXPLOIT"
              ? "rgba(220, 38, 38, 0.08)"
              : entry.finding_type === "SPECULATIVE_RISK"
                ? "rgba(234, 179, 8, 0.08)"
                : "rgba(59, 130, 246, 0.08)";
          return (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border px-4 py-3"
              style={{ borderColor, backgroundColor: bgColor }}
            >
              <span className="text-sm font-medium text-[#f3f4f6]">
                Iteration {i + 1}
              </span>
              <div className="flex items-center gap-2">
                {entry.evidence.length > 0 && (
                  <span className="text-xs text-[#9ca3af]">
                    ({entry.evidence.length} evidence)
                  </span>
                )}
                <span className={`rounded px-2.5 py-1 text-xs font-semibold ${ftColor}`}>
                  {entry.finding_type}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div
        className={`mt-4 rounded-lg border p-3 text-center text-base font-bold tracking-wider ${
          ctx.status === "SECURED"
            ? "border-green-900/50 bg-[#0a3b0a] text-green-400"
            : ctx.status === "PATCH_REJECTED"
              ? "border-red-900/50 bg-[#3b0a0a] text-red-400"
              : ctx.status === "ESCALATION_REQUIRED"
                ? "border-orange-900/50 bg-[#3b2a0a] text-orange-400"
                : "border-[#1f2937] bg-[#1f2937] text-[#9ca3af]"
        }`}
      >
        {ctx.status}
      </div>
    </div>
  );
};

export default SecurityConvergence;
