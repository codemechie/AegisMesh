import type { FC } from "react";
import Button from "../ui/Button";

const HeroSectionContent: FC = () => (
  <div className="relative flex min-h-screen items-center overflow-hidden">
    <div className="absolute inset-0 bg-grid-pattern opacity-[0.04]" />
    <div className="absolute top-[-15%] left-[-5%] h-[70%] w-[55%] animate-glow-pulse rounded-full bg-[#22c55e]/10 blur-[140px]" />
    <div className="absolute bottom-[-20%] right-[-10%] h-[60%] w-[40%] animate-float rounded-full bg-purple-700/10 blur-[140px]" />
    <div className="absolute top-[40%] left-[60%] h-[30%] w-[25%] animate-glow-pulse rounded-full bg-blue-500/5 blur-[100px]" style={{ animationDelay: "2s" }} />
    <div className="relative mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 lg:px-8">
      <div className="mb-8 inline-flex animate-fade-in items-center gap-2 rounded-full border border-[#22c55e]/30 bg-[#22c55e]/10 px-4 py-1.5 text-xs font-semibold text-[#22c55e]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e] animate-pulse" />
        Multi-Agent AI Security Platform
      </div>
      <h1 className="mx-auto max-w-5xl text-4xl font-black leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl text-[#f3f4f6]">
        Autonomous Security Remediation{" "}
        <span className="animate-gradient-shift text-transparent bg-clip-text bg-gradient-to-r from-[#22c55e] via-[#4ade80] to-[#16a34a]">
          Powered by Multi-Agent Collaboration
        </span>
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[#9ca3af] sm:text-lg">
        AegisMesh patches vulnerabilities, challenges its own fixes, and delivers
        deployment-ready security decisions through collaborating AI agents.
      </p>
      <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <Button to="/dashboard" size="lg" className="shadow-lg shadow-[#22c55e]/25 hover:shadow-xl hover:shadow-[#22c55e]/30">
          Launch Demo
          <span className="text-lg">&rarr;</span>
        </Button>
        <Button
          variant="secondary"
          size="lg"
          className="backdrop-blur-sm"
          onClick={() => {
            document.getElementById("transcript-preview")?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          View Transcript
        </Button>
      </div>
      <div className="mt-20 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[#1f2937] bg-[#1f2937] sm:grid-cols-4">
        <div className="bg-[#111827]/80 p-4 sm:p-5">
          <div className="text-lg font-black text-[#f3f4f6] sm:text-2xl">3</div>
          <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9ca3af]">
            Specialized AI Agents
          </div>
        </div>
        <div className="bg-[#111827]/80 p-4 sm:p-5">
          <div className="text-lg font-black text-[#f3f4f6] sm:text-2xl">3</div>
          <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9ca3af]">
            Frontier Models
          </div>
        </div>
        <div className="bg-[#111827]/80 p-4 sm:p-5">
          <div className="text-lg font-black text-[#f3f4f6] sm:text-2xl">100%</div>
          <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9ca3af]">
            Benchmark-Driven Architecture
          </div>
        </div>
        <div className="bg-[#111827]/80 p-4 sm:p-5">
          <div className="text-lg font-black text-[#f3f4f6] sm:text-2xl">Auto</div>
          <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9ca3af]">
            Autonomous Security Decisions
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default HeroSectionContent;
