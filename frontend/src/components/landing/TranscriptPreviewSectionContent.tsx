import type { FC } from "react";
import Button from "../ui/Button";
import SectionHeader from "../ui/SectionHeader";
import { TRANSCRIPT_EVENTS } from "../../data/landing";

const TranscriptPreviewSectionContent: FC = () => (
  <>
    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-900/30 to-transparent" />
    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-900/30 to-transparent" />
    <SectionHeader
      pre="Transparency"
      title="Agent Collaboration Transcript"
      description="Every interaction between agents is recorded in a chronological, judge-friendly transcript with full provenance."
    />
    <div className="mx-auto max-w-2xl rounded-xl border border-[#1f2937] bg-[#111827] shadow-xl shadow-black/20">
      <div className="flex items-center justify-between rounded-t-xl border-b border-[#1f2937] bg-[#0a0f1a] px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ef4444] shadow-sm shadow-red-500/30" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#eab308] shadow-sm shadow-yellow-500/30" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#22c55e] shadow-sm shadow-green-500/30" />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6b7280]">
            BAND Collaboration Transcript
          </span>
        </div>
        <span className="rounded border border-[#1f2937] bg-[#111827] px-2 py-0.5 text-[9px] font-mono text-[#4b5563]">
          live
        </span>
      </div>
      <div className="space-y-0 px-4 py-3">
        {TRANSCRIPT_EVENTS.map((ev) => (
          <div key={ev.badge + ev.agent} className="flex gap-3 border-l-2 border-transparent py-2.5 pl-3 transition-colors hover:border-[#1f2937] hover:bg-[#0d1525]/50">
            <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${ev.dot} shadow-sm`} />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className={`text-xs font-semibold ${ev.color}`}>{ev.agent}</span>
                <span className="rounded bg-[#1f2937] px-1 py-0.5 text-[8px] font-mono font-semibold uppercase text-[#6b7280]">
                  {ev.badge}
                </span>
              </div>
              <p className="mt-0.5 text-xs leading-relaxed text-[#d1d5db]">{ev.message}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-[#1f2937] bg-[#0a0f1a] px-4 py-3 text-center">
        <span className="text-[10px] text-[#4b5563]">
          Full transcript with timestamps, finding badges, and session metadata
        </span>
      </div>
    </div>
    <div className="mt-10 text-center">
      <Button to="/dashboard" variant="secondary" className="backdrop-blur-sm">
        Run a Mesh to View Full Transcript &rarr;
      </Button>
    </div>
  </>
);

export default TranscriptPreviewSectionContent;
