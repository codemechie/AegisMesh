import { useParams, useNavigate } from "react-router-dom";
import { useMeshData } from "../context/MeshDataContext";
import type { EventRecord } from "../types/mesh";

type BadgeVariant = "VERIFIED_EXPLOIT" | "SPECULATIVE_RISK" | "INFORMATIONAL" | "SECURED" | "ESCALATION_REQUIRED";

const BADGE_STYLES: Record<BadgeVariant, string> = {
  VERIFIED_EXPLOIT: "bg-red-900/60 text-red-400 border-red-700",
  SPECULATIVE_RISK: "bg-yellow-900/60 text-yellow-400 border-yellow-700",
  INFORMATIONAL: "bg-blue-900/60 text-blue-400 border-blue-700",
  SECURED: "bg-green-900/60 text-green-400 border-green-700",
  ESCALATION_REQUIRED: "bg-orange-900/60 text-orange-400 border-orange-700",
};

const EVENT_AGENT: Record<string, { agent: string; abbr: string; color: string; accent: string; bg: string; border: string }> = {
  VULNERABILITY_TRIAGED: {
    agent: "Blue Coder Agent",
    abbr: "BLUE",
    color: "text-blue-400",
    accent: "border-l-blue-500/60",
    bg: "bg-blue-900/10",
    border: "border-blue-900/30",
  },
  PATCH_GENERATED: {
    agent: "Blue Coder Agent",
    abbr: "BLUE",
    color: "text-blue-400",
    accent: "border-l-blue-500/60",
    bg: "bg-blue-900/10",
    border: "border-blue-900/30",
  },
  PATCH_PROPOSED: {
    agent: "Blue Coder Agent",
    abbr: "BLUE",
    color: "text-blue-400",
    accent: "border-l-blue-500/60",
    bg: "bg-blue-900/10",
    border: "border-blue-900/30",
  },
  AUDIT_STARTED: {
    agent: "Red Auditor Agent",
    abbr: "RED",
    color: "text-red-400",
    accent: "border-l-red-500/60",
    bg: "bg-red-900/10",
    border: "border-red-900/30",
  },
  AUDIT_COMPLETED: {
    agent: "Red Auditor Agent",
    abbr: "RED",
    color: "text-red-400",
    accent: "border-l-red-500/60",
    bg: "bg-red-900/10",
    border: "border-red-900/30",
  },
  PATCH_REJECTED: {
    agent: "Red Auditor Agent",
    abbr: "RED",
    color: "text-red-400",
    accent: "border-l-red-500/60",
    bg: "bg-red-900/10",
    border: "border-red-900/30",
  },
  PATCH_ACCEPTED: {
    agent: "Blue Coder Agent",
    abbr: "BLUE",
    color: "text-blue-400",
    accent: "border-l-blue-500/60",
    bg: "bg-blue-900/10",
    border: "border-blue-900/30",
  },
  SECURITY_REPORT_GENERATED: {
    agent: "Security Intelligence Agent",
    abbr: "SI",
    color: "text-purple-400",
    accent: "border-l-purple-500/60",
    bg: "bg-purple-900/10",
    border: "border-purple-900/30",
  },
  MESH_COMPLETED: {
    agent: "System",
    abbr: "SYS",
    color: "text-[#9ca3af]",
    accent: "border-l-gray-500/40",
    bg: "bg-gray-900/10",
    border: "border-gray-900/30",
  },
  MESH_ITERATION: {
    agent: "System",
    abbr: "SYS",
    color: "text-[#9ca3af]",
    accent: "border-l-gray-500/40",
    bg: "bg-gray-900/10",
    border: "border-gray-900/30",
  },
  AGENT_FAILURE: {
    agent: "System",
    abbr: "SYS",
    color: "text-red-400",
    accent: "border-l-red-500/40",
    bg: "bg-red-900/10",
    border: "border-red-900/30",
  },
};

const DEFAULT_EVENT_STYLE = {
  agent: "System",
  abbr: "SYS",
  color: "text-[#9ca3af]",
  accent: "border-l-gray-500/40",
  bg: "bg-gray-900/10",
  border: "border-gray-900/30",
};

const HIGHLIGHT_EVENTS = new Set([
  "PATCH_GENERATED",
  "AUDIT_COMPLETED",
  "SECURITY_REPORT_GENERATED",
  "MESH_COMPLETED",
  "AGENT_FAILURE",
]);

function extractMessage(event: EventRecord): string {
  const p = event.payload;
  if (typeof p.message === "string" && p.message) return p.message;
  if (typeof p.summary === "string" && p.summary) return p.summary;
  if (typeof p.description === "string" && p.description) return p.description;
  if (typeof p.exploit_found === "string" && p.exploit_found) return p.exploit_found;
  if (typeof p.evaluation_result === "string" && p.evaluation_result) return p.evaluation_result;
  if (typeof p.reason === "string" && p.reason) return p.reason;
  if (typeof p.error === "string" && p.error) return `Error: ${p.error}`;
  if (typeof p.file_path === "string" && p.file_path) return `Target: ${p.file_path}`;
  return event.event_type.replace(/_/g, " ");
}

function extractFindingType(payload: Record<string, unknown>): BadgeVariant | null {
  const ft = payload.finding_type;
  if (
    ft === "VERIFIED_EXPLOIT" ||
    ft === "SPECULATIVE_RISK" ||
    ft === "INFORMATIONAL"
  ) {
    return ft as BadgeVariant;
  }
  if (payload.is_secure === true) return "SECURED";
  if (payload.deployment_recommendation === "ESCALATION_REQUIRED") return "ESCALATION_REQUIRED";
  return null;
}

function formatTimestamp(ts: string): string {
  try {
    const d = new Date(ts);
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  } catch {
    return ts;
  }
}

function AgentAvatar({ abbr, bg, color }: { abbr: string; bg: string; color: string }) {
  return (
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[10px] font-bold uppercase tracking-wider ${bg} ${color} ring-2 ring-[#1f2937]`}
    >
      {abbr}
    </div>
  );
}

function Badge({ variant }: { variant: BadgeVariant }) {
  return (
    <span
      className={`inline-flex rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${BADGE_STYLES[variant]}`}
    >
      {variant.replace(/_/g, " ")}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-md text-center">
        <div className="mb-4 text-5xl text-[#4b5563]">{"\u{1F4CB}"}</div>
        <h2 className="mb-2 text-xl font-bold text-[#f3f4f6]">No Transcript Available</h2>
        <p className="text-sm leading-relaxed text-[#9ca3af]">
          Run a mesh session from the dashboard first, then return here to view the
          agent collaboration transcript.
        </p>
      </div>
    </div>
  );
}

function TranscriptMessage({ event, isLast }: { event: EventRecord; isLast: boolean }) {
  const style = EVENT_AGENT[event.event_type] ?? DEFAULT_EVENT_STYLE;
  const findingType = extractFindingType(event.payload);
  const message = extractMessage(event);
  const time = formatTimestamp(event.timestamp);
  const isHighlighted = HIGHLIGHT_EVENTS.has(event.event_type);

  return (
    <div className="relative flex gap-3">
      {!isLast && (
        <div className="absolute bottom-0 left-4 top-10 w-px bg-[#1f2937]" />
      )}
      <AgentAvatar abbr={style.abbr} bg={style.bg} color={style.color} />
      <div
        className={`min-w-0 flex-1 rounded-lg border ${style.border} ${style.accent} border-l-2 pb-3 pl-3 pt-3 ${isHighlighted ? "shadow-sm" : ""}`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-sm font-semibold ${style.color}`}>{style.agent}</span>
          <span className="text-[10px] font-mono text-[#4b5563]">{time}</span>
          <span
            className={`rounded px-1.5 py-0.5 text-[9px] font-mono uppercase ${
              isHighlighted
                ? "bg-[#1f2937] text-[#f3f4f6] font-semibold"
                : "bg-[#1f2937]/60 text-[#6b7280]"
            }`}
          >
            {event.event_type}
          </span>
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-[#d1d5db]">{message}</p>
        {findingType && (
          <div className="mt-2">
            <Badge variant={findingType} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function TranscriptViewer() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { data } = useMeshData();

  const sessionMismatch = data && sessionId && data.session_id !== sessionId;

  if (!data || sessionMismatch) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] text-[#f3f4f6]">
        <div className="mx-auto max-w-3xl p-6">
          <EmptyState />
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="rounded-lg border border-[#1f2937] bg-[#111827] px-4 py-2 text-sm font-semibold text-[#9ca3af] transition-colors hover:bg-[#1f2937] hover:text-[#f3f4f6]"
            >
              &larr; Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const telemetry = data.benchmark_telemetry;
  const report = data.security_report;
  const status = telemetry?.final_status ?? data.status;
  const sortedEvents = data.event_history
    ? [...data.event_history].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )
    : [];

  const messageCount = sortedEvents.length;

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-[#f3f4f6]">
      <div className="mx-auto max-w-4xl p-4 sm:p-6">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="mb-4 inline-flex items-center gap-1.5 rounded-lg border border-[#1f2937] bg-[#111827] px-3 py-1.5 text-xs font-semibold text-[#9ca3af] transition-colors hover:bg-[#1f2937] hover:text-[#f3f4f6]"
        >
          &larr; Dashboard
        </button>

        <div className="rounded-xl border border-[#1f2937] bg-[#111827] shadow-lg">
          <div className="border-b border-[#1f2937] p-4 sm:p-6">
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              BAND Collaboration Transcript
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-[#9ca3af]">
              This transcript reconstructs the multi-agent collaboration session mirrored into{" "}
              <span className="font-semibold text-[#22c55e]">BAND</span> during execution.
              Three AI agents — <span className="text-blue-400">Blue Coder</span>,{" "}
              <span className="text-red-400">Red Auditor</span>, and{" "}
              <span className="text-purple-400">Security Intelligence</span>{" "}
              — collaborated autonomously to remediate and validate a security vulnerability.
            </p>
          </div>

          <div className="border-b border-[#1f2937] bg-[#0a0f1a]">
            <div className="p-4 sm:p-6">
              <div className="mb-1 text-[9px] font-semibold uppercase tracking-wider text-[#6b7280]">
                BAND Collaboration Summary
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                <div className="rounded-lg border border-[#1f2937] bg-[#111827] p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-900/60 text-[7px] font-bold text-blue-400 ring-2 ring-[#111827]">
                        B
                      </div>
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-900/60 text-[7px] font-bold text-red-400 ring-2 ring-[#111827]">
                        R
                      </div>
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-900/60 text-[7px] font-bold text-purple-400 ring-2 ring-[#111827]">
                        S
                      </div>
                    </div>
                    <span className="text-xs text-[#d1d5db]">3 Agents</span>
                  </div>
                </div>
                <div className="rounded-lg border border-[#1f2937] bg-[#111827] p-3">
                  <div className="text-lg font-bold text-[#f3f4f6]">{messageCount}</div>
                  <div className="text-[10px] font-medium uppercase tracking-wider text-[#6b7280]">
                    Messages Exchanged
                  </div>
                </div>
                <div className="rounded-lg border border-[#1f2937] bg-[#111827] p-3">
                  <div className={`text-lg font-bold ${
                    status === "SECURED" ? "text-green-400" : "text-orange-400"
                  }`}>
                    {status === "SECURED" ? "Secured" : status}
                  </div>
                  <div className="text-[10px] font-medium uppercase tracking-wider text-[#6b7280]">
                    Security Outcome
                  </div>
                </div>
                <div className="rounded-lg border border-[#1f2937] bg-[#111827] p-3">
                  <div className="text-lg font-bold text-[#f3f4f6]">
                    {data.mesh_iteration}
                  </div>
                  <div className="text-[10px] font-medium uppercase tracking-wider text-[#6b7280]">
                    Total Iterations
                  </div>
                </div>
                <div className="rounded-lg border border-[#1f2937] bg-[#111827] p-3">
                  <div className="text-lg font-bold text-[#f3f4f6]">
                    {report?.security_score ?? "\u2014"}
                  </div>
                  <div className="text-[10px] font-medium uppercase tracking-wider text-[#6b7280]">
                    Security Score
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-[#1f2937] px-6 pb-4">
              <div className="text-[9px] font-semibold uppercase tracking-wider text-[#6b7280]">
                Agent Participants
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-900/40 bg-blue-900/20 px-3 py-1 text-xs font-semibold text-blue-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                  Blue Coder Agent
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-red-900/40 bg-red-900/20 px-3 py-1 text-xs font-semibold text-red-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                  Red Auditor Agent
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-900/40 bg-purple-900/20 px-3 py-1 text-xs font-semibold text-purple-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                  Security Intelligence Agent
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#9ca3af]">
                Agent Conversation Log
              </h2>
              <span className="text-[10px] text-[#4b5563]">
                {sortedEvents.length} event{sortedEvents.length !== 1 ? "s" : ""}
              </span>
            </div>
            {sortedEvents.length === 0 ? (
              <p className="text-sm italic text-[#4b5563]">
                No events recorded for this session.
              </p>
            ) : (
              <div className="space-y-0">
                {sortedEvents.map((event, idx) => (
                  <TranscriptMessage
                    key={event.event_id}
                    event={event}
                    isLast={idx === sortedEvents.length - 1}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
