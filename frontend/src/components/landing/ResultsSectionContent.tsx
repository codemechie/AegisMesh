import type { FC } from "react";
import SectionHeader from "../ui/SectionHeader";
import { RESULTS } from "../../data/landing";

const ResultsSectionContent: FC = () => (
  <>
    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#22c55e]/20 to-transparent" />
    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#22c55e]/10 to-transparent" />
    <SectionHeader
      pre="Benchmarks"
      title="Proven Results"
      description="Benchmark outcomes from the AegisMesh adversarial remediation pipeline."
    />
    <div className="grid gap-6 sm:grid-cols-3">
      {RESULTS.map((r) => (
        <div
          key={r.vulnerability}
          className={`group rounded-xl border ${r.border} bg-gradient-to-b from-[#111827] to-[#0d1525] p-6 text-center shadow-lg ${r.glow} transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}
        >
          <div className="text-xs font-semibold uppercase tracking-wider text-[#9ca3af]">
            {r.vulnerability}
          </div>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-green-900/40 bg-green-900/20 px-2.5 py-0.5 text-xs font-bold text-green-400">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
            {r.status}
          </div>
          <div className="mt-6">
            <div className="text-6xl font-black tracking-tight text-[#f3f4f6]">{r.score}</div>
            <div className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-[#6b7280]">Security Score</div>
          </div>
          <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-[#1f2937]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#22c55e] to-[#16a34a] transition-all duration-1000"
              style={{ width: `${r.score}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  </>
);

export default ResultsSectionContent;
