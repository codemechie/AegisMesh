import type { FC } from "react";
import type { MeshContext } from "../types/mesh";

interface SecurityIntelligenceReportProps {
  ctx?: MeshContext;
}

const RISK_COLORS: Record<string, string> = {
  LOW: "border-green-900/50 bg-[#0a3b0a] text-green-400",
  MEDIUM: "border-yellow-900/50 bg-[#3b3b0a] text-yellow-400",
  HIGH: "border-orange-900/50 bg-[#3b2a0a] text-orange-400",
  CRITICAL: "border-red-900/50 bg-[#3b0a0a] text-red-400",
};

const RISK_GLOW: Record<string, string> = {
  LOW: "shadow-green-900/30",
  MEDIUM: "shadow-yellow-900/30",
  HIGH: "shadow-orange-900/30",
  CRITICAL: "shadow-red-900/30",
};

const RECOMMENDATION_STYLES: Record<string, string> = {
  APPROVE: "border-green-700 bg-green-900/60 text-green-400",
  APPROVE_WITH_MONITORING:
    "border-yellow-700 bg-yellow-900/60 text-yellow-400",
  ESCALATE_REVIEW: "border-orange-700 bg-orange-900/60 text-orange-400",
  BLOCK: "border-red-700 bg-red-900/60 text-red-400",
};

const Metric = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <div className="rounded-lg border border-[#1f2937] bg-[#0a0f1a] p-3">
    <div className="text-xs font-medium uppercase tracking-wider text-[#9ca3af]">
      {label}
    </div>
    <div className="mt-1 text-xl font-bold text-[#f3f4f6]">{value}</div>
  </div>
);

const SecurityIntelligenceReportComponent: FC<SecurityIntelligenceReportProps> = ({
  ctx,
}) => {
  const report = ctx?.security_report;

  if (!report) {
    return (
      <div className="rounded-xl border border-[#1f2937] bg-[#111827] p-6 shadow-lg">
        <h3 className="mb-2 font-semibold text-[#f3f4f6]">
          Security Intelligence Report
        </h3>
        <p className="text-sm text-[#9ca3af]">
          Run a mesh to generate a security intelligence report.
        </p>
      </div>
    );
  }

  const riskColor = RISK_COLORS[report.risk_level] ?? RISK_COLORS.CRITICAL;
  const riskGlow = RISK_GLOW[report.risk_level] ?? RISK_GLOW.CRITICAL;
  const recStyle =
    RECOMMENDATION_STYLES[report.deployment_recommendation] ??
    "border-gray-700 bg-gray-900/60 text-gray-400";

  return (
    <div
      className={`rounded-xl border border-[#1f2937] bg-[#111827] p-6 shadow-lg ${riskGlow}`}
    >
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#f3f4f6]">
            Security Intelligence Report
          </h3>
          <div className="mt-1 flex items-center gap-2">
            <span className="rounded bg-purple-900/60 px-2 py-0.5 text-xs font-medium text-purple-400">
              AI GENERATED
            </span>
            <span className="text-xs text-[#6b7280]">
              Security Intelligence Agent &middot; {report.model}
            </span>
          </div>
        </div>
        <span
          className={`rounded-lg border px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${recStyle}`}
        >
          {report.deployment_recommendation}
        </span>
      </div>

      {/* Executive Summary */}
      <div className="mb-5 rounded-lg border border-purple-900/30 bg-[#0a0f1a] p-4">
        <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#9ca3af]">
          Executive Summary
        </div>
        <p className="text-sm leading-relaxed text-[#d1d5db]">
          {report.executive_summary}
        </p>
      </div>

      {/* Primary metrics row */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        <div
          className={`col-span-1 flex flex-col items-center justify-center rounded-xl border ${riskColor} p-4`}
        >
          <div className="text-4xl font-extrabold">{report.security_score}</div>
          <div className="mt-1 text-xs font-bold uppercase tracking-widest">
            {report.risk_level}
          </div>
        </div>

        <Metric
          label="Confidence"
          value={`${(report.confidence * 100).toFixed(0)}%`}
        />
        <Metric label="Risk Level" value={report.risk_level} />
        <Metric label="Recommendation" value={report.deployment_recommendation} />
      </div>

      {/* Finding Breakdown */}
      <div className="mb-5">
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#9ca3af]">
          Finding Breakdown
        </h4>
        <div className="grid grid-cols-4 gap-3">
          <Metric label="Verified Exploits" value={report.verified_exploits} />
          <Metric label="Speculative Risks" value={report.speculative_risks} />
          <Metric
            label="Informational"
            value={report.informational_findings}
          />
          <Metric
            label="Audit Degradations"
            value={report.audit_degradations}
          />
        </div>
      </div>

      {/* Reasoning */}
      {report.reasoning.length > 0 && (
        <div className="mb-5">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#9ca3af]">
            Reasoning
          </h4>
          <ul className="space-y-1.5">
            {report.reasoning.map((r, i) => (
              <li
                key={i}
                className="rounded-lg bg-[#0a0f1a] px-3 py-2 text-sm text-[#d1d5db]"
              >
                <span className="mr-2 text-[#6b7280]">&bull;</span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Remaining Risks */}
      {report.remaining_risks.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#9ca3af]">
            Remaining Risks
          </h4>
          <ul className="space-y-1.5">
            {report.remaining_risks.map((r, i) => (
              <li
                key={i}
                className="rounded-lg bg-[#3b0a0a] px-3 py-2 text-sm text-red-400"
              >
                <span className="mr-2 text-red-600">&bull;</span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SecurityIntelligenceReportComponent;
