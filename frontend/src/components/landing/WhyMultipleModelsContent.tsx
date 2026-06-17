import type { FC } from "react";

const WhyMultipleModelsContent: FC = () => (
  <>
    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#1f2937] to-transparent" />
    <div className="relative overflow-hidden rounded-2xl border border-[#1f2937] bg-gradient-to-br from-[#111827] to-[#0d1525] p-8 shadow-xl shadow-black/20 sm:p-10">
      <div className="absolute top-[-40%] right-[-10%] h-[70%] w-[30%] animate-glow-pulse rounded-full bg-purple-700/10 blur-[100px]" />
      <div className="relative">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#1f2937] bg-[#0a0f1a] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#6b7280]">
          AI Model Selection
        </div>
        <h3 className="text-xl font-bold text-[#f3f4f6] sm:text-2xl">Why Multiple Frontier Models?</h3>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#9ca3af]">
          Security remediation requires fundamentally different reasoning tasks — from code synthesis to
          adversarial simulation to deployment optimization. No single model excels at all three. AegisMesh
          runs a continuous model benchmarking pipeline across every available frontier model (Qwen3-Coder,
          DeepSeek, GPT-4o, etc.) and routes each AI agent to the model that delivers the strongest results
          for its specific reasoning task.
        </p>
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <div className="flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-blue-900/40 bg-blue-900/20 text-sm font-bold text-blue-400 shadow-sm">
              Q
            </div>
            <span className="mt-1.5 text-[11px] font-mono text-[#6b7280]">Qwen3-Coder</span>
            <span className="text-[10px] text-[#4b5563]">Patch Generation</span>
          </div>
          <div className="flex items-center">
            <span className="text-xl text-[#4b5563]">&rarr;</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-red-900/40 bg-red-900/20 text-sm font-bold text-red-400 shadow-sm">
              D
            </div>
            <span className="mt-1.5 text-[11px] font-mono text-[#6b7280]">DeepSeek</span>
            <span className="text-[10px] text-[#4b5563]">Security Audit</span>
          </div>
          <div className="flex items-center">
            <span className="text-xl text-[#4b5563]">&rarr;</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-purple-900/40 bg-purple-900/20 text-sm font-bold text-purple-400 shadow-sm">
              G
            </div>
            <span className="mt-1.5 text-[11px] font-mono text-[#6b7280]">GPT-4o</span>
            <span className="text-[10px] text-[#4b5563]">Risk Assessment</span>
          </div>
        </div>
        <p className="mt-6 text-xs leading-relaxed text-[#6b7280]">
          Every model is benchmarked before deployment. Every routing decision is data-driven.
          No single point of AI failure.
        </p>
      </div>
    </div>
  </>
);

export default WhyMultipleModelsContent;
