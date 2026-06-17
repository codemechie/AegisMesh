import type { FC } from "react";
import SectionHeader from "../ui/SectionHeader";
import { AI_AGENTS } from "../../data/landing";

const AIIntelligenceLayerContent: FC = () => (
  <>
    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-900/30 to-transparent" />
    <SectionHeader
      pre="Multi-Agent AI Intelligence Layer"
      title="Specialized AI Agent Architecture"
      description="AegisMesh assigns each stage of remediation to the frontier model best suited for the task."
    />
    <div className="grid gap-6 lg:grid-cols-3">
      {AI_AGENTS.map((agent) => (
        <div
          key={agent.role}
          className={`group rounded-xl border ${agent.border} ${agent.bg} p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl`}
        >
          <div className="flex items-center gap-3">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${agent.border} bg-[#0a0f1a] text-lg shadow-sm`}>
              {agent.icon}
            </div>
            <div className="min-w-0">
              <div className={`text-xs font-semibold ${agent.color}`}>{agent.role}</div>
              <div className="mt-0.5 truncate text-[10px] font-mono font-medium text-[#6b7280]">
                {agent.model}
              </div>
            </div>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-[#9ca3af]">
            {agent.description}
          </p>
          <div className="mt-4 space-y-1.5">
            {agent.capabilities.map((cap) => (
              <div key={cap} className="flex items-center gap-2 text-xs text-[#d1d5db]">
                <span className={`h-1 w-1 shrink-0 rounded-full ${agent.dot}`} />
                {cap}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
    <div className="mx-auto mt-14 max-w-3xl rounded-xl border border-[#1f2937] bg-gradient-to-r from-[#111827] via-[#0d1525] to-[#111827] p-6 text-center sm:p-8">
      <h3 className="text-lg font-bold text-[#f3f4f6] sm:text-xl">Artificial Intelligence at Every Stage</h3>
      <p className="mt-3 text-sm leading-relaxed text-[#9ca3af]">
        AegisMesh combines frontier AI models, adversarial reasoning, and collaborative agent
        workflows to autonomously remediate and validate software vulnerabilities. Instead of
        relying on a single general-purpose model, AegisMesh uses specialized AI agents that
        independently reason about remediation, attack simulation, and deployment decisions.
      </p>
    </div>
  </>
);

export default AIIntelligenceLayerContent;
