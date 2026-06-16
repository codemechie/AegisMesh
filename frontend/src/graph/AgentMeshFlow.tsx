import type { FC } from "react";
import type { MeshContext } from "../types/mesh";

interface AgentMeshFlowProps {
  ctx?: MeshContext;
}

const StepArrow: FC = () => (
  <div className="flex justify-center py-1">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#4b5563]">
      <path d="M12 4v14m0 0l-5-5m5 5l5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);

const AgentMeshFlow: FC<AgentMeshFlowProps> = ({ ctx }) => {
  if (!ctx) {
    return (
      <div className="rounded-xl border border-[#1f2937] bg-[#111827] p-6 shadow-lg">
        <h3 className="mb-2 font-semibold text-[#f3f4f6]">Agent Mesh Execution Flow</h3>
        <p className="text-sm text-[#9ca3af]">Run a mesh to visualise the agent execution flow.</p>
      </div>
    );
  }

  const { original_vulnerability: vuln, active_models: models, latest_patch: patch, audit_history: auditHistory, security_report: report, status, benchmark_telemetry: bt } = ctx;

  const findingCounts = { VERIFIED_EXPLOIT: 0, SPECULATIVE_RISK: 0, INFORMATIONAL: 0 };
  for (const a of auditHistory) {
    const ft = a.finding_type;
    if (ft in findingCounts) findingCounts[ft as keyof typeof findingCounts]++;
  }

  return (
    <div className="rounded-xl border border-[#1f2937] bg-[#111827] p-6 shadow-lg">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="font-semibold text-[#f3f4f6]">Agent Mesh Execution Flow</h3>
        <span className="text-[10px] font-medium uppercase tracking-wider text-[#6b7280]">
          {bt?.mesh_iterations ?? 0} iteration{(bt?.mesh_iterations ?? 0) !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex flex-col">
        {/* Node 1: Vulnerability */}
        <div className="rounded-lg border border-red-900/50 bg-[#3b0a0a] p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-900/60 text-xs text-red-400">!</span>
            <span className="text-xs font-bold uppercase tracking-wider text-red-400">Vulnerability Detected</span>
          </div>
          <p className="text-sm text-[#f3f4f6]">{vuln.description}</p>
          <div className="mt-2 flex gap-2">
            <span className="rounded bg-red-900/60 px-2 py-0.5 text-[10px] font-semibold text-red-300">
              {vuln.severity}
            </span>
            {vuln.cve_id && (
              <span className="rounded bg-[#1f2937] px-2 py-0.5 text-[10px] font-mono text-[#9ca3af]">
                {vuln.cve_id}
              </span>
            )}
          </div>
        </div>

        <StepArrow />

        {/* Node 2: Blue Agent */}
        <div className="rounded-lg border border-blue-900/50 bg-[#0a1628] p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-900/60 text-xs text-blue-400">B</span>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Blue Agent — Patch Generator</span>
          </div>
          {models?.blue && (
            <div className="mb-2 flex items-center gap-1.5">
              <span className="rounded border border-blue-900/50 bg-blue-900/20 px-1.5 py-0.5 text-[10px] font-semibold text-blue-400">
                MODEL
              </span>
              <span className="text-xs text-[#9ca3af]">{models.blue}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-green-400 text-sm font-bold">{'\u2713'}</span>
            <span className="text-sm text-[#f3f4f6]">
              {patch ? "Patch generated successfully" : "Patch generation attempted"}
            </span>
          </div>
          {patch?.architectural_changes && (
            <p className="mt-1.5 text-xs text-[#6b7280] ml-6">
              {patch.architectural_changes}
            </p>
          )}
          <div className="mt-2 flex gap-2 text-[10px] text-[#6b7280]">
            <span>Iterations: {bt?.mesh_iterations ?? 0}</span>
            {bt?.blue_model && <span>&middot; {bt.blue_model.split("/").pop() ?? ""}</span>}
          </div>
        </div>

        <StepArrow />

        {/* Node 3: Red Agent */}
        <div className="rounded-lg border border-yellow-900/50 bg-[#3b2a0a] p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-900/60 text-xs text-yellow-400">R</span>
            <span className="text-xs font-bold uppercase tracking-wider text-yellow-400">Red Agent — Adversarial Auditor</span>
          </div>
          {models?.red && (
            <div className="mb-2 flex items-center gap-1.5">
              <span className="rounded border border-yellow-900/50 bg-yellow-900/20 px-1.5 py-0.5 text-[10px] font-semibold text-yellow-400">
                MODEL
              </span>
              <span className="text-xs text-[#9ca3af]">{models.red}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-green-400 text-sm font-bold">{'\u2713'}</span>
            <span className="text-sm text-[#f3f4f6]">Audit complete</span>
          </div>
          {(auditHistory.length > 0) && (
            <div className="mt-2 flex flex-wrap gap-1.5 ml-6">
              {findingCounts.VERIFIED_EXPLOIT > 0 && (
                <span className="rounded bg-red-900/60 px-2 py-0.5 text-[10px] font-semibold text-red-400">
                  {findingCounts.VERIFIED_EXPLOIT} Verified
                </span>
              )}
              {findingCounts.SPECULATIVE_RISK > 0 && (
                <span className="rounded bg-yellow-900/60 px-2 py-0.5 text-[10px] font-semibold text-yellow-400">
                  {findingCounts.SPECULATIVE_RISK} Speculative
                </span>
              )}
              {findingCounts.INFORMATIONAL > 0 && (
                <span className="rounded bg-blue-900/60 px-2 py-0.5 text-[10px] font-semibold text-blue-400">
                  {findingCounts.INFORMATIONAL} Info
                </span>
              )}
            </div>
          )}
          <div className="mt-2 flex gap-2 text-[10px] text-[#6b7280]">
            <span>{auditHistory.length} audit{auditHistory.length !== 1 ? "s" : ""}</span>
            {bt?.red_model && <span>&middot; {bt.red_model.split("/").pop() ?? ""}</span>}
          </div>
        </div>

        <StepArrow />

        {/* Node 4: Security Intelligence */}
        <div className="rounded-lg border border-purple-900/50 bg-[#1a0a2e] p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-900/60 text-xs text-purple-400">SI</span>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Security Intelligence — Assessor</span>
          </div>
          {models?.security_intelligence && (
            <div className="mb-2 flex items-center gap-1.5">
              <span className="rounded border border-purple-900/50 bg-purple-900/20 px-1.5 py-0.5 text-[10px] font-semibold text-purple-400">
                MODEL
              </span>
              <span className="text-xs text-[#9ca3af]">{models.security_intelligence}</span>
            </div>
          )}
          {report ? (
            <>
              <div className="flex items-center gap-2">
                <span className="text-green-400 text-sm font-bold">{'\u2713'}</span>
                <span className="text-sm text-[#f3f4f6]">Assessment complete</span>
              </div>
              <div className="mt-2 ml-6 flex flex-wrap items-center gap-3">
                <div>
                  <div className="text-lg font-black text-[#f3f4f6]">{report.security_score}</div>
                  <div className="text-[10px] uppercase tracking-wider text-[#6b7280]">Score</div>
                </div>
                <div
                  className={`rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    report.risk_level === "LOW"
                      ? "bg-green-900/60 text-green-400"
                      : report.risk_level === "MEDIUM"
                        ? "bg-yellow-900/60 text-yellow-400"
                        : report.risk_level === "HIGH"
                          ? "bg-orange-900/60 text-orange-400"
                          : "bg-red-900/60 text-red-400"
                  }`}
                >
                  {report.risk_level}
                </div>
                <div
                  className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                    report.deployment_recommendation === "APPROVE"
                      ? "bg-green-900/60 text-green-400"
                      : report.deployment_recommendation === "APPROVE_WITH_MONITORING"
                        ? "bg-yellow-900/60 text-yellow-400"
                        : "bg-red-900/60 text-red-400"
                  }`}
                >
                  {report.deployment_recommendation.replace(/_/g, " ")}
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-[#9ca3af]">Assessment pending</p>
          )}
        </div>

        <StepArrow />

        {/* Node 5: Final Status */}
        <div
          className={`rounded-lg border p-4 text-center ${
            status === "SECURED"
              ? "border-green-900/50 bg-[#0a3b0a]"
              : status === "PATCH_REJECTED"
                ? "border-red-900/50 bg-[#3b0a0a]"
                : status === "ESCALATION_REQUIRED"
                  ? "border-orange-900/50 bg-[#3b2a0a]"
                  : "border-[#1f2937] bg-[#1f2937]"
          }`}
        >
          <div
            className={`text-lg font-bold ${
              status === "SECURED"
                ? "text-green-400"
                : status === "PATCH_REJECTED"
                  ? "text-red-400"
                  : status === "ESCALATION_REQUIRED"
                    ? "text-orange-400"
                    : "text-[#9ca3af]"
            }`}
          >
            {status === "SECURED" ? "\u2713 " : ""}{status}
          </div>
          {status === "SECURED" && (
            <div className="mt-1 flex items-center justify-center gap-2">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
              <span className="text-xs text-green-500">Mesh converged &middot; Deployment ready</span>
            </div>
          )}
          {status === "SECURED" && report?.deployment_recommendation && (
            <span
              className={`mt-2 inline-block rounded px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${
                report.deployment_recommendation === "APPROVE"
                  ? "bg-green-900/60 text-green-400"
                  : report.deployment_recommendation === "APPROVE_WITH_MONITORING"
                    ? "bg-yellow-900/60 text-yellow-400"
                    : "bg-red-900/60 text-red-400"
              }`}
            >
              {report.deployment_recommendation.replace(/_/g, " ")}
            </span>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-[#1f2937] pt-4 text-[10px] text-[#6b7280]">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
          <span>Blue Agent — Patch Generation</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
          <span>Red Agent — Adversarial Audit</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
          <span>Security Intelligence — Assessment</span>
        </div>
      </div>
    </div>
  );
};

export default AgentMeshFlow;
