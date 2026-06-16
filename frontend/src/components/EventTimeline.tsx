import type { FC } from "react";
import type { MeshContext } from "../types/mesh";

interface EventTimelineProps {
  ctx?: MeshContext;
}

const DOT_COLORS: Record<string, string> = {
  VULNERABILITY_TRIAGED: "bg-red-500",
  PATCH_PROPOSED: "bg-blue-500",
  AUDIT_COMPLETED: "bg-green-500",
};

const TEXT_COLORS: Record<string, string> = {
  VULNERABILITY_TRIAGED: "text-red-400",
  PATCH_PROPOSED: "text-blue-400",
  AUDIT_COMPLETED: "text-green-400",
};

const FT_BADGE: Record<string, string> = {
  VERIFIED_EXPLOIT: "bg-red-900/70 text-red-300",
  SPECULATIVE_RISK: "bg-yellow-900/70 text-yellow-300",
  INFORMATIONAL: "bg-blue-900/70 text-blue-300",
};

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "??:??:??.???";
    return d.toISOString().slice(11, 23);
  } catch {
    return "??:??:??.???";
  }
}

const EventTimeline: FC<EventTimelineProps> = ({ ctx }) => {
  const events = ctx?.event_history ?? [];

  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-[#1f2937] bg-[#111827] p-6 shadow-lg">
        <h3 className="mb-2 font-semibold text-[#f3f4f6]">Event Timeline</h3>
        <p className="text-sm text-[#9ca3af]">No events recorded yet.</p>
      </div>
    );
  }

  const sorted = [...events].reverse();

  return (
    <div className="rounded-xl border border-[#1f2937] bg-[#111827] p-6 shadow-lg">
      <h3 className="mb-4 font-semibold text-[#f3f4f6]">Event Timeline</h3>
      <div className="max-h-[400px] space-y-2 overflow-y-auto">
        {sorted.map((ev) => (
          <div
            key={ev.event_id}
            className="flex items-center gap-3 rounded-lg bg-[#0a0f1a] px-3 py-2"
          >
            <span
              className={`h-2.5 w-2.5 shrink-0 rounded-full ${DOT_COLORS[ev.event_type] ?? "bg-gray-500"}`}
            />
            <span className="shrink-0 font-mono text-xs text-[#6b7280]">
              {formatTime(ev.timestamp)}
            </span>
            <span
              className={`text-sm font-medium ${TEXT_COLORS[ev.event_type] ?? "text-[#9ca3af]"}`}
            >
              {ev.event_type}
            </span>
            {ev.event_type === "AUDIT_COMPLETED" && (
              (() => {
                const c = (ev.payload as Record<string, unknown>)?.critique as Record<string, unknown> | undefined;
                const ft = c?.finding_type as string | undefined;
                const conf = c?.confidence as string | undefined;
                const badgeClass = FT_BADGE[ft ?? ""] ?? "bg-gray-900/70 text-gray-300";
                return (
                  <span className={`ml-auto rounded px-2 py-0.5 text-xs font-semibold ${badgeClass}`}>
                    {ft ?? "UNKNOWN"} {conf ?? ""}
                  </span>
                );
              })()
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventTimeline;
