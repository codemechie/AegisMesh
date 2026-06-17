import type { FC } from "react";
import SectionHeader from "../ui/SectionHeader";
import { PROBLEMS } from "../../data/landing";

const ProblemSectionContent: FC = () => (
  <>
    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#1f2937] to-transparent" />
    <SectionHeader
      pre="The Challenge"
      title="The Security Remediation Gap"
      description="Modern security teams are overwhelmed. The gap between vulnerability discovery and remediation leaves organizations exposed."
    />
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {PROBLEMS.map((p) => (
        <div
          key={p.title}
          className="group rounded-xl border border-[#1f2937] bg-[#111827] p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#374151] hover:shadow-lg hover:shadow-black/20"
        >
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-[#1f2937] bg-[#0a0f1a] text-lg transition-colors group-hover:border-[#374151]">
            {p.icon}
          </div>
          <h3 className="text-sm font-bold text-[#f3f4f6]">{p.title}</h3>
          <p className="mt-2 text-xs leading-relaxed text-[#9ca3af]">{p.description}</p>
        </div>
      ))}
    </div>
  </>
);

export default ProblemSectionContent;
