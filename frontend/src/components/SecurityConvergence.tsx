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
        {ctx.audit_history.map((entry, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-lg border px-4 py-3"
            style={{
              borderColor: entry.is_secure
                ? "rgba(22, 163, 74, 0.3)"
                : "rgba(220, 38, 38, 0.3)",
              backgroundColor: entry.is_secure
                ? "rgba(22, 163, 74, 0.08)"
                : "rgba(220, 38, 38, 0.08)",
            }}
          >
            <span className="text-sm font-medium text-[#f3f4f6]">
              Iteration {i + 1}
            </span>
            <span
              className={`rounded px-2.5 py-1 text-xs font-semibold ${
                entry.is_secure
                  ? "bg-green-900/60 text-green-400"
                  : "bg-red-900/60 text-red-400"
              }`}
            >
              {entry.is_secure ? "Secure" : "Vulnerable"}
            </span>
          </div>
        ))}
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
