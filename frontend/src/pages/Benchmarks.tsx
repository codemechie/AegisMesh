import type { FC } from "react";
import { useNavigate } from "react-router-dom";
import { BENCHMARK_RESULTS, type BenchmarkResult } from "../data/benchmarks";

const RISK_COLORS: Record<string, string> = {
  LOW: "border-green-900/50 bg-[#0a3b0a] text-green-400 shadow-green-900/20",
  MEDIUM: "border-yellow-900/50 bg-[#3b3b0a] text-yellow-400 shadow-yellow-900/20",
  HIGH: "border-orange-900/50 bg-[#3b2a0a] text-orange-400 shadow-orange-900/20",
  CRITICAL: "border-red-900/50 bg-[#3b0a0a] text-red-400 shadow-red-900/20",
};

const STATUS_STYLES: Record<string, string> = {
  SECURED: "bg-green-900/60 text-green-400 border-green-700",
  AUDITING: "bg-blue-900/60 text-blue-400 border-blue-700",
  UNDER_REVIEW: "bg-yellow-900/60 text-yellow-400 border-yellow-700",
  ESCALATION_REQUIRED: "bg-red-900/60 text-red-400 border-red-700",
};

const FindingWidget: FC<{ label: string; count: number; color: string }> = ({
  label,
  count,
  color,
}) => (
  <div className="flex items-center gap-1.5">
    <span className={`h-2 w-2 rounded-full ${color}`} />
    <span className="text-[10px] text-[#6b7280]">{label}</span>
    <span className="text-xs font-semibold text-[#f3f4f6]">{count}</span>
  </div>
);

const ResultCard: FC<{ result: BenchmarkResult }> = ({ result }) => {
  const riskColor =
    RISK_COLORS[result.riskLevel] ?? RISK_COLORS.CRITICAL;
  const statusStyle =
    STATUS_STYLES[result.finalStatus] ?? "bg-gray-900/60 text-gray-400 border-gray-700";

  return (
    <div className="rounded-xl border border-[#1f2937] bg-[#111827] p-6 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:border-[#374151] hover:shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-bold tracking-tight text-[#f3f4f6]">
          {result.title}
        </h3>
        <span
          className={`rounded-lg border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusStyle}`}
        >
          {result.finalStatus}
        </span>
      </div>

      <p className="mb-5 text-xs leading-relaxed text-[#9ca3af]">
        {result.description}
      </p>

      {/* Security Score */}
      <div
        className={`mb-4 flex flex-col items-center justify-center rounded-xl border py-4 ${riskColor}`}
      >
        <div className="text-5xl font-black tracking-tight text-[#f3f4f6]">
          {result.securityScore}
        </div>
        <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#9ca3af]">
          Security Score
        </div>
        <span className="mt-1 rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-green-900/60 text-green-400">
          {result.riskLevel} Risk
        </span>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-[#1f2937] bg-[#0a0f1a] p-2.5">
          <div className="text-[10px] font-medium uppercase tracking-wider text-[#6b7280]">
            Runtime
          </div>
          <div className="mt-0.5 text-sm font-bold text-[#f3f4f6]">
            {result.runtime}
          </div>
        </div>
        <div className="rounded-lg border border-[#1f2937] bg-[#0a0f1a] p-2.5">
          <div className="text-[10px] font-medium uppercase tracking-wider text-[#6b7280]">
            Iterations
          </div>
          <div className="mt-0.5 text-sm font-bold text-[#f3f4f6]">
            {result.iterations}
          </div>
        </div>
      </div>

      {/* Findings breakdown */}
      <div className="mt-3 space-y-1 rounded-lg bg-[#0a0f1a] px-2.5 py-2">
        <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[#6b7280]">
          Findings
        </div>
        <FindingWidget
          label="Verified Exploits"
          count={result.findings.verifiedExploits}
          color="bg-red-500"
        />
        <FindingWidget
          label="Speculative Risks"
          count={result.findings.speculativeRisks}
          color="bg-yellow-500"
        />
        <FindingWidget
          label="Informational"
          count={result.findings.informational}
          color="bg-blue-500"
        />
      </div>
    </div>
  );
};

const Benchmarks: FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-[#f3f4f6]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="mb-6 inline-flex items-center gap-1.5 rounded-lg border border-[#1f2937] bg-[#111827] px-3 py-1.5 text-xs font-semibold text-[#9ca3af] transition-colors hover:bg-[#1f2937] hover:text-[#f3f4f6]"
        >
          &larr; Back
        </button>

        {/* Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Benchmark Results</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#9ca3af]">
            The following results were collected from the AegisMesh automated benchmarking pipeline.
            Each scenario injects a known vulnerability class into a minimal codebase and measures the
            multi-agent system&apos;s ability to remediate, validate, and assess the security outcome.
          </p>
        </div>

        {/* Methodology */}
        <div className="mb-8 rounded-xl border border-[#1f2937] bg-[#111827] p-5 shadow-lg">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#9ca3af]">
            Methodology
          </h2>
          <p className="text-sm leading-relaxed text-[#d1d5db]">
            Each benchmark scenario follows a three-phase protocol. First, the <strong>Blue Coder Agent</strong> (
            <span className="text-blue-400">Qwen3-Coder</span>) generates a security patch. Next, the{" "}
            <strong>Red Auditor Agent</strong> (<span className="text-red-400">DeepSeek</span>) performs a
            Graph-of-Thoughts adversarial analysis to probe for residual vulnerabilities. Finally, the{" "}
            <strong>Security Intelligence Agent</strong> (<span className="text-purple-400">GPT-4o</span>)
            scores the result and issues a deployment recommendation. All times are wall-clock including
            API latency across three frontier model providers.
          </p>
        </div>

        {/* Results Grid */}
        <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {BENCHMARK_RESULTS.map((result) => (
            <ResultCard key={result.id} result={result} />
          ))}
        </div>

        {/* Benchmark-Driven Architecture */}
        <div className="rounded-xl border border-[#1f2937] bg-[#111827] p-6 shadow-lg">
          <div className="mb-1 flex items-center gap-2">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded border border-[#22c55e]/30 bg-[#22c55e]/10 text-[10px] text-[#22c55e]">
              {"\u2699"}
            </span>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#9ca3af]">
              Benchmark-Driven Architecture
            </h2>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-[#d1d5db]">
            Model selection and architectural decisions in AegisMesh are not arbitrary. Each frontier model
            was systematically evaluated across the full benchmark suite before being assigned its role.
            <strong> Qwen3-Coder</strong> was chosen as the Blue Agent for its superior patch generation accuracy
            and compilation success rate. <strong>DeepSeek</strong> was selected as the Red Auditor for its
            strength in adversarial security reasoning. <strong>GPT-4o</strong> powers the Security Intelligence
            Agent, delivering the most precise risk assessments and deployment recommendations.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[#d1d5db]">
            The benchmarking pipeline runs continuously, evaluating new models as they become available and
            routing each agent to the best-performing frontier model for its specific role. This ensures that
            AegisMesh remains at the forefront of AI-powered security remediation without requiring manual
            configuration changes.
          </p>
        </div>
      </div>

      {/* Footer — subtle */}
      <div className="border-t border-[#1f2937]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <p className="text-[10px] text-[#4b5563]">
            &copy; 2026 AegisMesh. Multi-Agent Security Remediation System.
          </p>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-[10px] text-[#4b5563] transition-colors hover:text-[#9ca3af]"
          >
            &larr; Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Benchmarks;
