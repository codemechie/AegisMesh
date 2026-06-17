import { useParams, useNavigate } from "react-router-dom";
import { useMeshData } from "../context/MeshDataContext";
import TranscriptMessageCard from "../components/transcript/TranscriptMessageCard";
import TranscriptSummary from "../components/transcript/TranscriptSummary";
import EmptyTranscriptState from "../components/shared/EmptyTranscriptState";

export default function TranscriptViewer() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { data } = useMeshData();

  const sessionMismatch = data && sessionId && data.session_id !== sessionId;

  if (!data || sessionMismatch) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] text-[#f3f4f6]">
        <div className="mx-auto max-w-3xl p-6">
          <EmptyTranscriptState />
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="rounded-lg border border-[#1f2937] bg-[#111827] px-4 py-2 text-sm font-semibold text-[#9ca3af] transition-colors hover:bg-[#1f2937] hover:text-[#f3f4f6]"
            >
              &larr; Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const sortedEvents = data.event_history
    ? [...data.event_history].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )
    : [];

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-[#f3f4f6]">
      <div className="mx-auto max-w-4xl p-4 sm:p-6">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
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

          <TranscriptSummary data={data} messageCount={sortedEvents.length} />

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
                  <TranscriptMessageCard
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
