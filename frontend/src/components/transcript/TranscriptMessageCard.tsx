import type { FC } from "react";
import type { EventRecord } from "../../types/mesh";
import { EVENT_AGENT, DEFAULT_EVENT_STYLE, HIGHLIGHT_EVENTS } from "../../constants/transcript";
import { extractMessage, extractFindingType } from "../../utils/transcript";
import { formatTimestamp } from "../../utils/time";
import TranscriptEventAvatar from "../shared/TranscriptEventAvatar";
import FindingBadge from "../shared/FindingBadge";

interface TranscriptMessageCardProps {
  event: EventRecord;
  isLast: boolean;
}

const TranscriptMessageCard: FC<TranscriptMessageCardProps> = ({ event, isLast }) => {
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
      <TranscriptEventAvatar abbr={style.abbr} bg={style.bg} color={style.color} />
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
            <FindingBadge variant={findingType} />
          </div>
        )}
      </div>
    </div>
  );
};

export default TranscriptMessageCard;
