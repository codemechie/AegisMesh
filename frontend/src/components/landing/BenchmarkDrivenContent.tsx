import type { FC } from "react";
import SectionHeader from "../ui/SectionHeader";
import { BENCHMARK_FINDINGS } from "../../data/landing";

const BenchmarkDrivenContent: FC = () => (
  <>
    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#1f2937] to-transparent" />
    <SectionHeader
      pre="AI Engineering Rigor"
      title="Benchmark-Driven Model Architecture"
      description="Every model routing decision is backed by systematic benchmark evaluation. No arbitrary choices."
    />
    <div className="mx-auto max-w-3xl space-y-3">
      {BENCHMARK_FINDINGS.map((finding) => (
        <div
          key={finding.text}
          className="group flex items-start gap-3 rounded-xl border border-[#1f2937] bg-[#111827] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#374151] hover:shadow-lg"
        >
          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#22c55e]/30 bg-[#22c55e]/10">
            <span className="text-[10px] text-[#22c55e]">{"\u2713"}</span>
          </div>
          <p className="text-sm leading-relaxed text-[#d1d5db]">{finding.text}</p>
        </div>
      ))}
    </div>
  </>
);

export default BenchmarkDrivenContent;
