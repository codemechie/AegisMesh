import type { FC } from "react";
import SectionHeader from "../ui/SectionHeader";
import { WORKFLOW } from "../../data/landing";

const HowItWorksSectionContent: FC = () => (
  <>
    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-900/30 to-transparent" />
    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-900/30 to-transparent" />
    <SectionHeader
      pre="Architecture"
      title="How It Works"
      description="Three specialized AI agents collaborate in an adversarial loop to remediate vulnerabilities."
    />
    <div className="relative mx-auto max-w-3xl">
      <div className="absolute left-[29px] top-0 h-full w-px bg-gradient-to-b from-blue-500/30 via-red-500/30 via-purple-500/30 to-[#22c55e]/30 hidden sm:block" />
      <div className="space-y-6">
        {WORKFLOW.map((step) => (
          <div key={step.step} className="group relative flex items-start gap-5">
            <div
              className={`relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border text-xl font-bold shadow-lg transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-xl ${step.border} ${step.bg} ${step.color} ${step.glows ?? ""}`}
            >
              {step.icon ?? step.step}
            </div>
            <div
              className={`min-w-0 flex-1 rounded-xl border p-5 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-lg ${step.border} ${step.bg} ${step.glows ?? ""}`}
            >
              <div className="flex items-center gap-2">
                <span className="rounded border border-[#1f2937] bg-[#0a0f1a] px-1.5 py-0.5 text-[10px] font-mono font-bold text-[#4b5563]">
                  {step.step}
                </span>
                <span className={`text-sm font-bold ${step.color}`}>
                  {step.label}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[#9ca3af]">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </>
);

export default HowItWorksSectionContent;
