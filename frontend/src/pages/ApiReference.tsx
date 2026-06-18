import { useNavigate } from "react-router-dom";
import type { FC } from "react";

const RUN_RESPONSE_JSON = JSON.stringify({
  session_id: "session-a1b2c3d4-...",
  status: "SECURED",
  source_file: { file_path: "submitted.py", raw_code: "def evaluate(input_str):\n    return eval(input_str)", language: "python" },
  vulnerability: { description: "Code injection via eval() on line 2", target_lines: [2], severity: "HIGH" },
  latest_patch: "def evaluate(input_str):\n    allowed = {'abs', 'max', 'min', 'sum'}\n    ...",
  audit_history: [
    {
      agent: "Red Auditor",
      finding: "DOM-based XSS via innerHTML",
      severity: "SPECULATIVE_RISK",
      evidence: ["Line 42: document.getElementById('output').innerHTML = ..."],
      remediation: "Use textContent instead of innerHTML",
      type: "xss"
    }
  ],
  exploit_chain: [
    { description: "Crafted payload bypasses input-length check", severity: "HIGH", exploit_found: true, iteration: 1 }
  ],
  agent_failures: [],
  benchmark_telemetry: {
    mesh_iterations: 2, verified_exploits: 1, speculative_risks: 2, informational_findings: 4,
    audit_degradations: 0, invalid_evidence_count: 0, evidence_downgrades: 0,
    final_status: "SECURED", time_started: "2026-06-18T10:15:30+00:00", time_completed: "2026-06-18T10:16:45+00:00"
  },
  active_models: { blue: "alibaba/qwen3-coder-480b-a35b-instruct", red: "deepseek/deepseek-chat", security_intelligence: "openai/gpt-4o" },
  mesh_iteration: 2,
  max_mesh_iterations: 8,
  original_vulnerability: { description: "Code injection via eval() on line 2", target_lines: [2], severity: "HIGH" },
  event_history: [
    { event_id: "evt-001", event_type: "VULNERABILITY_TRIAGED", agent: "system", timestamp: "2026-06-18T10:15:30+00:00", payload: {} }
  ],
  system_logs: ["[BlueCoder] received VULNERABILITY_TRIAGED", "[RedAuditor] AUDIT_COMPLETED"]
}, null, 2);

const RUN_REQUEST_JSON = JSON.stringify({
  source_code: "def evaluate(input_str):\n    return eval(input_str)",
  vulnerability: "Code injection via eval() on line 2 \u2014 unsanitised user input flows directly into a dynamic eval() call, enabling arbitrary Python execution."
}, null, 2);

const TRANSCRIPT_RESPONSE_JSON = JSON.stringify({
  session_id: "session-a1b2c3d4-...",
  status: "SECURED",
  source_file: { file_path: "submitted.py", raw_code: "def evaluate(input_str):\n    return eval(input_str)", language: "python" },
  vulnerability: { description: "Code injection via eval() on line 2", target_lines: [2], severity: "HIGH" },
  latest_patch: "def evaluate(input_str):\n    allowed = {'abs', 'max', 'min', 'sum'}\n    ...",
  audit_history: [
    { agent: "Red Auditor", finding: "DOM-based XSS via innerHTML", severity: "SPECULATIVE_RISK", evidence: ["Line 42: ..."], remediation: "Use textContent instead of innerHTML", type: "xss" }
  ],
  exploit_chain: [
    { description: "Crafted payload bypasses input-length check", severity: "HIGH", exploit_found: true, iteration: 1 }
  ],
  agent_failures: [],
  benchmark_telemetry: {
    mesh_iterations: 2, verified_exploits: 1, speculative_risks: 2, informational_findings: 4,
    audit_degradations: 0, invalid_evidence_count: 0, evidence_downgrades: 0,
    final_status: "SECURED", time_started: "2026-06-18T10:15:30+00:00", time_completed: "2026-06-18T10:16:45+00:00"
  },
  active_models: { blue: "alibaba/qwen3-coder-480b-a35b-instruct", red: "deepseek/deepseek-chat", security_intelligence: "openai/gpt-4o" },
  mesh_iteration: 2,
  max_mesh_iterations: 8,
  event_history: [],
  system_logs: []
}, null, 2);

const endpointDiv = (method: string, path: string, desc: string, children: React.ReactNode) => (
  <div className="rounded-lg border border-[#1f2937] bg-[#111827]">
    <div className="flex items-start gap-3 border-b border-[#1f2937] px-5 py-4">
      <span className={`shrink-0 rounded px-2 py-0.5 font-mono text-xs font-bold ${
        method === "POST"
          ? "bg-[#065f46] text-[#6ee7b7]"
          : "bg-[#1e3a5f] text-[#93c5fd]"
      }`}>
        {method}
      </span>
      <div className="min-w-0">
        <code className="break-all font-mono text-sm text-[#e5e7eb]">{path}</code>
        <p className="mt-0.5 text-xs text-[#9ca3af]">{desc}</p>
      </div>
    </div>
    <div className="px-5 py-4">{children}</div>
  </div>
);

const codeBlockDiv = (label: string, code: string) => (
  <div className="mt-3 first:mt-0">
    <p className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#6b7280]">{label}</p>
    <pre className="overflow-x-auto rounded-lg border border-[#1f2937] bg-[#0a0f1a] p-4 font-mono text-xs leading-relaxed text-[#d1d5db]"><code>{code}</code></pre>
  </div>
);

const ApiReference: FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#0a0f1a] text-[#f3f4f6]">
      <div className="mx-auto max-w-4xl p-6">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="mb-6 inline-flex items-center gap-1.5 rounded-lg border border-[#1f2937] bg-[#111827] px-3 py-1.5 text-xs font-semibold text-[#9ca3af] transition-colors hover:bg-[#1f2937] hover:text-[#f3f4f6]"
        >
          &larr; Back
        </button>

        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">API Reference</h1>
          <p className="mt-1 text-sm text-[#9ca3af]">
            REST API reference for the AegisMesh multi-agent remediation system.
          </p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="mb-4 text-lg font-semibold">Endpoints</h2>
            <div className="space-y-4">
              {endpointDiv("POST", "/api/run", "Submit source code and a vulnerability description for auto-remediation.",
                <>
                  {codeBlockDiv("Request Body", RUN_REQUEST_JSON)}
                  {codeBlockDiv("Response", RUN_RESPONSE_JSON)}
                </>
              )}

              {endpointDiv("GET", "/api/transcript/:sessionId", "Retrieve the full shared context for a completed session.",
                <>
                  {codeBlockDiv("Response", TRANSCRIPT_RESPONSE_JSON)}
                </>
              )}
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold">Architecture</h2>
            <div className="overflow-x-auto rounded-lg border border-[#1f2937] bg-[#111827] p-6">
              <pre className="font-mono text-xs leading-loose text-[#d1d5db]">
{`\u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
\u2502   Frontend   \u2502  React + TypeScript + Tailwind
\u2502  (Dashboard) \u2502
\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u252c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518
       \u2502  HTTP (REST)
       \u25bc
\u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
\u2502   FastAPI    \u2502  Single POST /api/run endpoint
\u2502   (API)      \u2502  Validates input, orchestrates session
\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u252c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518
       \u2502  in-process
       \u25bc
\u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
\u2502              Band Mesh                  \u2502
\u2502  Publish/subscribe event bus            \u2502
\u2502  shared_context telemetry store         \u2502
\u2502  Events: VULNERABILITY_TRIAGED          \u2502
\u2502          PATCH_PROPOSED                 \u2502
\u2502          AUDIT_COMPLETED                \u2502
\u2502          SECURITY_REPORT_REQUESTED      \u2502
\u2502          SECURITY_REPORT_GENERATED      \u2502
\u2514\u2500\u2500\u252c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u252c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u252c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518
   \u2502       \u2502                      \u2502
   \u25bc       \u25bc                      \u25bc
\u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510 \u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510 \u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
\u2502 Blue   \u2502 \u2502  Red     \u2502 \u2502 Security     \u2502
\u2502 Coder  \u2502 \u2502 Auditor \u2502 \u2502 Intelligence \u2502
\u2502 (LLM)  \u2502 \u2502 (LLM)   \u2502 \u2502 (LLM)        \u2502
\u251c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524 \u251c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524 \u251c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524
\u2502Writes  \u2502 \u2502Audits    \u2502 \u2502Validates     \u2502
\u2502patches \u2502 \u2502patches,  \u2502 \u2502findings,     \u2502
\u2502        \u2502 \u2502detects   \u2502 \u2502triage,       \u2502
\u2502        \u2502 \u2502hallucin- \u2502 \u2502security      \u2502
\u2502        \u2502 \u2502ations    \u2502 \u2502report        \u2502
\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518 \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518 \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518`}
              </pre>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-[#1f2937] bg-[#0a0f1a] p-4">
                  <h4 className="text-sm font-semibold text-[#60a5fa]">Blue Coder</h4>
                  <p className="mt-1 text-xs text-[#9ca3af]">
                    Generates remediation patches using the configured LLM. Receives the original vulnerability context, exploit chain history, and audit feedback to produce targeted fixes.
                  </p>
                </div>
                <div className="rounded-lg border border-[#1f2937] bg-[#0a0f1a] p-4">
                  <h4 className="text-sm font-semibold text-[#f87171]">Red Auditor</h4>
                  <p className="mt-1 text-xs text-[#9ca3af]">
                    Audits each patch for residual vulnerabilities and hallucinated evidence. Produces structured findings with severity ratings (VERIFIED_EXPLOIT, SPECULATIVE_RISK, INFORMATIONAL).
                  </p>
                </div>
                <div className="rounded-lg border border-[#1f2937] bg-[#0a0f1a] p-4">
                  <h4 className="text-sm font-semibold text-[#a78bfa]">Security Intelligence</h4>
                  <p className="mt-1 text-xs text-[#9ca3af]">
                    Aggregates audit history, exploit chain, and agent telemetry into a final security report. Determines terminal status (SECURED or ESCALATION_REQUIRED).
                  </p>
                </div>
                <div className="rounded-lg border border-[#1f2937] bg-[#0a0f1a] p-4">
                  <h4 className="text-sm font-semibold text-[#34d399]">Band Mesh</h4>
                  <p className="mt-1 text-xs text-[#9ca3af]">
                    In-process event bus and shared telemetry context. All agents communicate through publish/subscribe. The shared_context is serialised and returned as the API response.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ApiReference;
