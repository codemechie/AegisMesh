import type { FC } from "react";
import { Link } from "react-router-dom";
import Logo from "../ui/Logo";

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

const linkClass = "text-xs text-[#9ca3af] transition-colors hover:text-[#f3f4f6]";
const externalLinkClass = "inline-flex items-center gap-1 text-xs text-[#9ca3af] transition-colors hover:text-[#f3f4f6]";

const ExternalLink: FC<{ href: string; children: string }> = ({ href, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className={externalLinkClass}>
    {children}
    <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  </a>
);

const FooterSectionContent: FC = () => (
  <footer className="border-t border-[#1f2937] bg-[#0a0f1a]">
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <Link to="/" className="flex items-center gap-3">
            <Logo />
            <span className="text-base font-bold tracking-tight text-[#f3f4f6]">AegisMesh</span>
          </Link>
          <p className="mt-3 max-w-xs text-xs leading-relaxed text-[#9ca3af]">
            Autonomous security remediation powered by multi-agent AI collaboration. Three frontier models work
            together to find, patch, and validate vulnerabilities.
          </p>
        </div>
        <div>
          <h4 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#22c55e]">Product</h4>
          <ul className="mt-4 space-y-2.5">
            <li>
              <Link to="/dashboard" className={linkClass}>
                Dashboard
              </Link>
            </li>
            <li>
              <span
                className={`cursor-pointer ${linkClass}`}
                onClick={() => scrollTo("how-it-works")}
              >
                How It Works
              </span>
            </li>
            <li>
              <span
                className={`cursor-pointer ${linkClass}`}
                onClick={() => scrollTo("transcript-preview")}
              >
                Transcripts
              </span>
            </li>
            <li>
              <Link to="/benchmarks" className={linkClass}>
                Benchmarks
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#22c55e]">AI & Technology</h4>
          <ul className="mt-4 space-y-2.5">
            <li>
              <span
                className={`cursor-pointer ${linkClass}`}
                onClick={() => scrollTo("ai-intelligence-layer")}
              >
                AI / ML
              </span>
            </li>
            <li>
              <ExternalLink href="https://opencode.ai">BAND</ExternalLink>
            </li>
            <li>
              <ExternalLink href="https://openrouter.ai">OpenRouter</ExternalLink>
            </li>
            <li>
              <ExternalLink href="https://fastapi.tiangolo.com">FastAPI</ExternalLink>
            </li>
            <li>
              <ExternalLink href="https://react.dev">React + TypeScript</ExternalLink>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#22c55e]">Connect</h4>
          <ul className="mt-4 space-y-2.5">
            <li>
              <ExternalLink href="https://github.com/codemechie/AegisMesh">GitHub</ExternalLink>
            </li>
            <li>
              <Link to="/documentation" className={linkClass}>
                Documentation
              </Link>
            </li>
            <li>
              <Link to="/api-reference" className={linkClass}>
                API Reference
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="mt-10 border-t border-[#1f2937] pt-6">
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-xs text-[#9ca3af]">
            &copy; 2026 AegisMesh. Multi-Agent Security Remediation System.
          </p>
          <p className="text-xs font-medium text-[#4b5563]">
            Powered by <span className="text-sm font-bold text-[#22c55e]">BAND</span>
          </p>
        </div>
      </div>
    </div>
  </footer>
);

export default FooterSectionContent;
