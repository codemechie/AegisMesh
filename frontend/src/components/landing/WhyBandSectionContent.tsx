import type { FC } from "react";
import { BAND_BENEFITS } from "../../data/landing";

const WhyBandSectionContent: FC = () => (
  <>
    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#22c55e]/20 to-transparent" />
    <div className="mb-14 text-center">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#22c55e]/20 bg-[#22c55e]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#22c55e]">
        BAND
      </div>
      <h2 className="text-3xl font-bold tracking-tight text-[#f3f4f6] sm:text-4xl">Why BAND?</h2>
      <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[#9ca3af]">
        BAND provides the communication layer that enables autonomous agents to collaborate,
        hand off tasks, and maintain full execution traceability.
      </p>
    </div>
    <div className="relative overflow-hidden rounded-2xl border border-[#1f2937] bg-gradient-to-br from-[#111827] to-[#0a1a0f] shadow-xl shadow-black/20">
      <div className="absolute top-[-50%] right-[-20%] h-[80%] w-[40%] animate-glow-pulse rounded-full bg-[#22c55e]/10 blur-[120px]" />
      <div className="relative grid gap-px bg-[#1f2937]/50 sm:grid-cols-2">
        {BAND_BENEFITS.map((b) => (
          <div key={b.title} className="group bg-[#111827]/80 p-6 backdrop-blur-sm transition-all duration-300 hover:bg-[#1a2332] sm:p-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-[#22c55e]/20 bg-[#22c55e]/10 text-lg shadow-lg shadow-[#22c55e]/5 transition-all duration-300 group-hover:border-[#22c55e]/40 group-hover:shadow-[#22c55e]/10">
              {b.icon}
            </div>
            <h3 className="text-sm font-bold text-[#f3f4f6]">{b.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#9ca3af]">{b.description}</p>
          </div>
        ))}
      </div>
    </div>
  </>
);

export default WhyBandSectionContent;
