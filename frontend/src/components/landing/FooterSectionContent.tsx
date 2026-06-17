import type { FC } from "react";
import Logo from "../ui/Logo";

const FooterSectionContent: FC = () => (
  <footer className="border-t border-[#1f2937] bg-[#0a0f1a]">
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <a href="/" className="flex items-center gap-3">
            <Logo />
            <span className="text-base font-bold tracking-tight text-[#f3f4f6]">AegisMesh</span>
          </a>
          <p className="mt-3 max-w-xs text-xs leading-relaxed text-[#6b7280]">
            Autonomous security remediation powered by multi-agent AI collaboration. Three frontier models work
            together to find, patch, and validate vulnerabilities.
          </p>
        </div>
        <div>
          <h4 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#4b5563]">Product</h4>
          <ul className="mt-4 space-y-2.5">
            <li>
              <a href="/dashboard" className="text-xs text-[#9ca3af] transition-colors hover:text-[#f3f4f6]">
                Dashboard
              </a>
            </li>
            <li>
              <a href="/" className="text-xs text-[#9ca3af] transition-colors hover:text-[#f3f4f6]">
                How It Works
              </a>
            </li>
            <li>
              <span className="text-xs text-[#9ca3af] transition-colors hover:text-[#f3f4f6] cursor-pointer" onClick={() => {
                document.getElementById("transcript-preview")?.scrollIntoView({ behavior: "smooth" });
              }}>
                Transcripts
              </span>
            </li>
            <li>
              <a href="/" className="text-xs text-[#9ca3af] transition-colors hover:text-[#f3f4f6]">
                Benchmarks
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#4b5563]">Technology</h4>
          <ul className="mt-4 space-y-2.5">
            <li>
              <span className="text-xs text-[#9ca3af]">BAND</span>
            </li>
            <li>
              <span className="text-xs text-[#9ca3af]">OpenRouter</span>
            </li>
            <li>
              <span className="text-xs text-[#9ca3af]">FastAPI</span>
            </li>
            <li>
              <span className="text-xs text-[#9ca3af]">React + TypeScript</span>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#4b5563]">Connect</h4>
          <ul className="mt-4 space-y-2.5">
            <li>
              <a href="#" className="text-xs text-[#9ca3af] transition-colors hover:text-[#f3f4f6]">
                GitHub
              </a>
            </li>
            <li>
              <a href="#" className="text-xs text-[#9ca3af] transition-colors hover:text-[#f3f4f6]">
                Documentation
              </a>
            </li>
            <li>
              <a href="#" className="text-xs text-[#9ca3af] transition-colors hover:text-[#f3f4f6]">
                API Reference
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="mt-10 border-t border-[#1f2937] pt-6">
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-[10px] text-[#4b5563]">
            &copy; 2026 AegisMesh. Multi-Agent Security Remediation System.
          </p>
          <p className="text-[10px] text-[#4b5563]">
            Powered by <span className="text-[#22c55e]">BAND</span>
          </p>
        </div>
      </div>
    </div>
  </footer>
);

export default FooterSectionContent;
