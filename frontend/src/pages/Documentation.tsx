import { useState, type FC } from "react";
import { useNavigate } from "react-router-dom";

interface Section {
  id: string;
  label: string;
}

const SECTIONS: Section[] = [
  { id: "overview", label: "Overview" },
  { id: "how-it-works", label: "How AegisMesh Works" },
  { id: "blue-coder", label: "Blue Coder Agent" },
  { id: "red-auditor", label: "Red Auditor Agent" },
  { id: "security-intelligence", label: "Security Intelligence Agent" },
  { id: "band-integration", label: "BAND Integration" },
  { id: "execution-flow", label: "Execution Flow" },
  { id: "security-reporting", label: "Security Reporting" },
  { id: "transcript-viewer", label: "Transcript Viewer" },
  { id: "architecture-summary", label: "Architecture Summary" },
];

const AGENT_BADGES: Record<string, string> = {
  "Blue Coder": "border-blue-900/50 bg-blue-900/20 text-blue-400",
  "Red Auditor": "border-red-900/50 bg-red-900/20 text-red-400",
  "Security Intelligence": "border-purple-900/50 bg-purple-900/20 text-purple-400",
};

const AgentBadge: FC<{ label: string }> = ({ label }) => {
  const style = AGENT_BADGES[label] ?? "border-gray-900/50 bg-gray-900/20 text-gray-400";
  return (
    <span className={`inline-flex rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${style}`}>
      {label}
    </span>
  );
};

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) {
    const offset = 100;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
  }
}

const Documentation: FC = () => {
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-[#f3f4f6]">
      <div className="mx-auto flex max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Sidebar */}
        <aside className="hidden shrink-0 lg:block lg:w-56 xl:w-64">
          <div className="sticky top-24">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="mb-6 inline-flex items-center gap-1.5 rounded-lg border border-[#1f2937] bg-[#111827] px-3 py-1.5 text-xs font-semibold text-[#9ca3af] transition-colors hover:bg-[#1f2937] hover:text-[#f3f4f6]"
            >
              &larr; Back
            </button>
            <nav className="space-y-0.5">
              {SECTIONS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => scrollToSection(s.id)}
                  className="block w-full rounded px-3 py-1.5 text-left text-xs text-[#6b7280] transition-colors hover:bg-[#1f2937] hover:text-[#9ca3af]"
                >
                  {s.label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <main className="min-w-0 flex-1 lg:ml-10 xl:ml-16">
          {/* Mobile header */}
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#1f2937] bg-[#111827] px-3 py-1.5 text-xs font-semibold text-[#9ca3af] transition-colors hover:bg-[#1f2937] hover:text-[#f3f4f6]"
            >
              &larr; Back
            </button>
            <button
              type="button"
              onClick={() => setMobileNavOpen((v) => !v)}
              className="rounded-lg border border-[#1f2937] bg-[#111827] px-3 py-1.5 text-xs font-semibold text-[#9ca3af] transition-colors hover:bg-[#1f2937] hover:text-[#f3f4f6]"
            >
              {mobileNavOpen ? "Close" : "Sections"}
            </button>
          </div>

          {mobileNavOpen && (
            <div className="mb-6 rounded-xl border border-[#1f2937] bg-[#111827] p-3 shadow-lg lg:hidden">
              <nav className="space-y-0.5">
                {SECTIONS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      scrollToSection(s.id);
                      setMobileNavOpen(false);
                    }}
                    className="block w-full rounded px-3 py-1.5 text-left text-xs text-[#6b7280] transition-colors hover:bg-[#1f2937] hover:text-[#9ca3af]"
                  >
                    {s.label}
                  </button>
                ))}
              </nav>
            </div>
          )}

          <div className="space-y-8">
            {/* Overview */}
            <section id="overview" className="scroll-mt-24">
              <div className="rounded-xl border border-[#1f2937] bg-[#111827] p-6 shadow-lg">
                <h1 className="text-2xl font-bold tracking-tight">AegisMesh Documentation</h1>
                <p className="mt-2 text-sm leading-relaxed text-[#9ca3af]">
                  AegisMesh is an autonomous security remediation system powered by multi-agent AI collaboration.
                  Three frontier models — <span className="text-blue-400">Qwen3-Coder</span>,{" "}
                  <span className="text-red-400">DeepSeek</span>, and{" "}
                  <span className="text-purple-400">GPT-4o</span> — work together through the{" "}
                  <span className="text-[#22c55e]">BAND</span> multi-agent protocol to find, patch, and validate
                  security vulnerabilities in source code.
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[#9ca3af]">
                  The system accepts a source file and a vulnerability description, then orchestrates a
                  three-agent pipeline: a patch is generated, adversarially tested, and scored. The result
                  is a security assessment with a deployment recommendation — all without human intervention.
                </p>
              </div>
            </section>

            {/* How AegisMesh Works */}
            <section id="how-it-works" className="scroll-mt-24">
              <div className="rounded-xl border border-[#1f2937] bg-[#111827] p-6 shadow-lg">
                <h2 className="text-lg font-bold tracking-tight">How AegisMesh Works</h2>
                <p className="mt-2 text-sm leading-relaxed text-[#9ca3af]">
                  The user provides source code and a vulnerability description via the Dashboard. The system
                  routes this input through three specialized AI agents connected by an event-driven mesh
                  architecture. Each agent operates independently, communicating only through structured
                  events broadcast across the mesh bus.
                </p>
                <ol className="mt-4 space-y-2 text-sm text-[#d1d5db]">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-900/60 text-[10px] font-bold text-blue-400">1</span>
                    <span><strong className="text-[#f3f4f6]">Triaging:</strong> The vulnerability is analyzed and routed to the Blue Coder.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-900/60 text-[10px] font-bold text-blue-400">2</span>
                    <span><strong className="text-[#f3f4f6]">Patch Generation:</strong> The Blue Coder produces a secure patch.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-900/60 text-[10px] font-bold text-red-400">3</span>
                    <span><strong className="text-[#f3f4f6]">Adversarial Audit:</strong> The Red Auditor probes the patch using Graph-of-Thoughts analysis.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-900/60 text-[10px] font-bold text-purple-400">4</span>
                    <span><strong className="text-[#f3f4f6]">Security Assessment:</strong> The Security Intelligence Agent scores the outcome and recommends deployment.</span>
                  </li>
                </ol>
              </div>
            </section>

            {/* Blue Coder Agent */}
            <section id="blue-coder" className="scroll-mt-24">
              <div className="rounded-xl border border-blue-900/30 bg-[#111827] p-6 shadow-lg">
                <div className="mb-3 flex items-center gap-2">
                  <AgentBadge label="Blue Coder" />
                  <span className="text-[10px] text-[#6b7280]">Qwen3-Coder</span>
                </div>
                <p className="text-sm leading-relaxed text-[#d1d5db]">
                  The Blue Coder Agent is responsible for generating security patches. Given the original source
                  code and the vulnerability description, it produces a patched version of the file along with
                  an explanation of the architectural changes made. The agent includes any new dependencies
                  required by the fix.
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[#d1d5db]">
                  Syntactic correctness is verified through automated compiler checks. If the patch fails to
                  compile, the system logs the failure and proceeds, ensuring the mesh never stalls on a
                  single agent step. The Blue Coder operates within a maximum iteration budget, after which
                  the mesh escalates if convergence has not been reached.
                </p>
              </div>
            </section>

            {/* Red Auditor Agent */}
            <section id="red-auditor" className="scroll-mt-24">
              <div className="rounded-xl border border-red-900/30 bg-[#111827] p-6 shadow-lg">
                <div className="mb-3 flex items-center gap-2">
                  <AgentBadge label="Red Auditor" />
                  <span className="text-[10px] text-[#6b7280]">DeepSeek</span>
                </div>
                <p className="text-sm leading-relaxed text-[#d1d5db]">
                  The Red Auditor Agent performs an adversarial security audit on every patch. Using a
                  Graph-of-Thoughts (GoT) reasoning engine, it explores multiple attack vectors in parallel,
                  evaluating each hypothesis against the patched code. Each thought node represents a distinct
                  exploitation strategy with a hypothesis and evaluation result.
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[#d1d5db]">
                  The audit produces a classification for each iteration: <strong className="text-red-400">VERIFIED_EXPLOIT</strong> if a viable
                  attack path was found, <strong className="text-yellow-400">SPECULATIVE_RISK</strong> if a potential weakness was identified that
                  requires additional context, or <strong className="text-blue-400">INFORMATIONAL</strong> for observations that do not
                  represent a direct exploit. Evidence items are validated against the actual source file
                  lines to prevent hallucinated citations.
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[#d1d5db]">
                  If the audit determines the patch is still vulnerable, the mesh re-engages the Blue Coder
                  for a revised patch, feeding the exploit chain as context. This loop continues until
                  the patch passes audit or the iteration budget is exhausted.
                </p>
              </div>
            </section>

            {/* Security Intelligence Agent */}
            <section id="security-intelligence" className="scroll-mt-24">
              <div className="rounded-xl border border-purple-900/30 bg-[#111827] p-6 shadow-lg">
                <div className="mb-3 flex items-center gap-2">
                  <AgentBadge label="Security Intelligence" />
                  <span className="text-[10px] text-[#6b7280]">GPT-4o</span>
                </div>
                <p className="text-sm leading-relaxed text-[#d1d5db]">
                  The Security Intelligence Agent aggregates the outputs of both the Blue and Red Agents to
                  produce a final security assessment. It generates an executive summary, a numeric security
                  score (0&ndash;100), a risk level (Low / Medium / High / Critical), and a deployment
                  recommendation (Approve / Approve with Monitoring / Escalate / Block).
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[#d1d5db]">
                  The report includes structured reasoning, a list of remaining risks, and a breakdown of
                  verified exploits, speculative risks, and informational findings. This report is the
                  authoritative output of the mesh and drives the final convergence decision.
                </p>
              </div>
            </section>

            {/* BAND Integration */}
            <section id="band-integration" className="scroll-mt-24">
              <div className="rounded-xl border border-[#1f2937] bg-[#111827] p-6 shadow-lg">
                <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight">
                  <span className="text-[#22c55e]">BAND</span>
                  <span className="text-[#9ca3af]">/</span>
                  <span className="text-sm font-normal text-[#9ca3af]">Multi-Agent Protocol</span>
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[#9ca3af]">
                  BAND is the event-driven multi-agent collaboration protocol that connects the three AI agents.
                  Each agent subscribes to specific event types on a shared mesh bus and reacts when those
                  events are broadcast. This decoupled architecture allows agents to be developed, tested, and
                  upgraded independently.
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[#d1d5db]">
                  The mesh bus handles event routing, payload distribution, listener failure recording, and
                  message mirroring. A BAND collaboration transcript is generated for each session, recording
                  every event, message, and state transition. This transcript can be reviewed in the
                  Transcript Viewer for full auditability.
                </p>
                <div className="mt-3 rounded-lg border border-[#1f2937] bg-[#0a0f1a] px-3 py-2">
                  <p className="text-[10px] font-mono text-[#6b7280]">
                    VULNERABILITY_TRIAGED &rarr; PATCH_PROPOSED &rarr; AUDIT_COMPLETED &rarr; SECURITY_REPORT_GENERATED
                  </p>
                </div>
              </div>
            </section>

            {/* Execution Flow */}
            <section id="execution-flow" className="scroll-mt-24">
              <div className="rounded-xl border border-[#1f2937] bg-[#111827] p-6 shadow-lg">
                <h2 className="text-lg font-bold tracking-tight">Execution Flow</h2>
                <p className="mt-2 text-sm leading-relaxed text-[#9ca3af]">
                  A full AegisMesh execution proceeds through the following stages:
                </p>
                <div className="mt-4 space-y-0">
                  {[
                    { step: "Submit", desc: "User provides source code and vulnerability via the Dashboard." },
                    { step: "Triage", desc: "The mesh validates the input and broadcasts VULNERABILITY_TRIAGED." },
                    { step: "Patch", desc: "Blue Coder generates and compiles the patch. Broadcasts PATCH_PROPOSED." },
                    { step: "Audit", desc: "Red Auditor runs GoT analysis. Broadcasts AUDIT_COMPLETED with findings." },
                    { step: "Re-iterate", desc: "If exploit found, mesh re-invokes Blue Coder with exploit context (up to max iterations)." },
                    { step: "Assess", desc: "Security Intelligence generates final report. Broadcasts SECURITY_REPORT_GENERATED." },
                    { step: "Converge", desc: "Mesh reaches SECURED or ESCALATION_REQUIRED status. Execution complete." },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 border-t border-[#1f2937] py-2.5 first:border-t-0"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1f2937] text-[10px] font-bold text-[#9ca3af]">
                        {i + 1}
                      </span>
                      <div>
                        <span className="text-xs font-semibold text-[#f3f4f6]">{item.step}</span>
                        <p className="mt-0.5 text-xs text-[#9ca3af]">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Security Reporting */}
            <section id="security-reporting" className="scroll-mt-24">
              <div className="rounded-xl border border-[#1f2937] bg-[#111827] p-6 shadow-lg">
                <h2 className="text-lg font-bold tracking-tight">Security Reporting</h2>
                <p className="mt-2 text-sm leading-relaxed text-[#9ca3af]">
                  The Security Intelligence Report is the final output of every mesh execution. It is displayed
                  prominently in the Dashboard and includes:
                </p>
                <ul className="mt-3 space-y-1.5 text-sm text-[#d1d5db]">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-[#6b7280]">&bull;</span>
                    <span><strong className="text-[#f3f4f6]">Executive Summary</strong> — Plain-language overview of the assessment.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-[#6b7280]">&bull;</span>
                    <span><strong className="text-[#f3f4f6]">Security Score</strong> — Numeric score from 0 to 100.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-[#6b7280]">&bull;</span>
                    <span><strong className="text-[#f3f4f6]">Risk Level</strong> — Categorical assessment (Low / Medium / High / Critical).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-[#6b7280]">&bull;</span>
                    <span><strong className="text-[#f3f4f6]">Deployment Recommendation</strong> — Approve, Approve with Monitoring, Escalate, or Block.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-[#6b7280]">&bull;</span>
                    <span><strong className="text-[#f3f4f6]">Findings Breakdown</strong> — Counts of verified exploits, speculative risks, and informational findings.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-[#6b7280]">&bull;</span>
                    <span><strong className="text-[#f3f4f6]">Reasoning</strong> — Structured list of reasoning steps behind the assessment.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-[#6b7280]">&bull;</span>
                    <span><strong className="text-[#f3f4f6]">Remaining Risks</strong> — Residual risks that were not fully remediated.</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Transcript Viewer */}
            <section id="transcript-viewer" className="scroll-mt-24">
              <div className="rounded-xl border border-[#1f2937] bg-[#111827] p-6 shadow-lg">
                <h2 className="text-lg font-bold tracking-tight">Transcript Viewer</h2>
                <p className="mt-2 text-sm leading-relaxed text-[#9ca3af]">
                  Every AegisMesh execution produces a full BAND collaboration transcript that records every
                  event, message, and state transition between the three agents. The Transcript Viewer presents
                  this data as a chronological conversation log, allowing judges and developers to inspect the
                  exact sequence of interactions that led to the final security assessment.
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[#d1d5db]">
                  The viewer displays agent messages with color-coded badges, timestamps, and structured
                  payloads. Each event type is rendered with appropriate styling: patch proposals show code
                  diffs, audit results show finding classifications, and report generation shows the final
                  score. A summary card provides aggregate metrics including total messages, model names, and
                  execution duration.
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[#d1d5db]">
                  The transcript is accessible from the Dashboard via a link in the BAND Agent Collaboration
                  section. Each session is addressable by its unique session ID at <code className="rounded bg-[#1f2937] px-1 py-0.5 font-mono text-[10px]">/transcript/:sessionId</code>.
                </p>
              </div>
            </section>

            {/* Architecture Summary */}
            <section id="architecture-summary" className="scroll-mt-24">
              <div className="rounded-xl border border-[#1f2937] bg-[#111827] p-6 shadow-lg">
                <h2 className="text-lg font-bold tracking-tight">Architecture Summary</h2>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#1f2937] text-[10px] uppercase tracking-wider text-[#6b7280]">
                        <th className="pb-2 pr-4">Component</th>
                        <th className="pb-2 pr-4">Role</th>
                        <th className="pb-2">Model</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["Blue Coder", "Patch Generation", "Qwen3-Coder"],
                        ["Red Auditor", "Adversarial Audit", "DeepSeek"],
                        ["Security Intelligence", "Risk Assessment", "GPT-4o"],
                        ["BAND Protocol", "Agent Orchestration", "Event Bus"],
                        ["Dashboard", "User Interface", "React + TypeScript"],
                        ["Backend API", "Execution Engine", "FastAPI / Python"],
                      ].map((row, i) => (
                        <tr key={i} className="border-t border-[#1f2937]">
                          <td className="py-2 pr-4 font-medium text-[#f3f4f6]">{row[0]}</td>
                          <td className="py-2 pr-4 text-[#9ca3af]">{row[1]}</td>
                          <td className="py-2 text-[#9ca3af]">{row[2]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-4 text-xs text-[#6b7280]">
                  The system is designed for extensibility. New agents can subscribe to existing events,
                  and the model routing layer can direct any agent to any compatible frontier model.
                </p>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Documentation;
