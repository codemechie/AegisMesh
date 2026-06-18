import type { FC } from "react";
import type { Evidence } from "../../types/mesh";

interface EvidenceListProps {
  evidence: Evidence[];
}

const EvidenceList: FC<EvidenceListProps> = ({ evidence }) => {
  if (evidence.length === 0) {
    return (
      <p className="text-sm italic text-[#6b7280]">No evidence provided.</p>
    );
  }

  return (
    <div className="space-y-1.5">
      {evidence.map((item, i) => (
        <div
          key={i}
          className="rounded-lg border border-[#1f2937] bg-[#0a0f1a] px-3 py-2"
        >
          <div className="flex items-center gap-2 text-xs">
            <span className="font-mono text-[#6b7280]">{item.file}</span>
            {item.line > 0 && (
              <span className="font-mono text-[#6b7280]">line {item.line}</span>
            )}
          </div>
          {item.reason && (
            <p className="mt-0.5 text-sm text-[#d1d5db]">{item.reason}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default EvidenceList;
