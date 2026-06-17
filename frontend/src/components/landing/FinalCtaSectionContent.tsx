import type { FC } from "react";
import Button from "../ui/Button";

const FinalCtaSectionContent: FC = () => (
  <>
    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#22c55e]/20 to-transparent" />
    <div className="relative overflow-hidden rounded-2xl border border-[#1f2937] bg-gradient-to-br from-[#111827] via-[#111827] to-[#0a1a0f] p-12 text-center shadow-xl shadow-black/20 sm:p-16">
      <div className="absolute top-[-30%] right-[-10%] h-[60%] w-[30%] animate-glow-pulse rounded-full bg-[#22c55e]/15 blur-[120px]" />
      <div className="absolute bottom-[-30%] left-[-10%] h-[60%] w-[30%] animate-float rounded-full bg-purple-700/10 blur-[120px]" />
      <div className="relative">
        <h2 className="text-3xl font-black tracking-tight text-[#f3f4f6] sm:text-4xl">See AegisMesh in Action</h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[#9ca3af]">
          Run a live mesh session. Watch three AI agents collaborate to find, patch, and
          validate security vulnerabilities in real time.
        </p>
        <div className="mt-10">
          <Button
            to="/dashboard"
            size="lg"
            className="shadow-lg shadow-[#22c55e]/25 hover:shadow-xl hover:shadow-[#22c55e]/30"
          >
            Launch Demo
            <span className="text-lg">&rarr;</span>
          </Button>
        </div>
      </div>
    </div>
  </>
);

export default FinalCtaSectionContent;
