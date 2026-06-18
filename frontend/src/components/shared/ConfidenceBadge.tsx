import type { FC } from "react";

const CONFIDENCE_STYLES: Record<string, string> = {
  HIGH: "bg-green-900/70 text-green-300 border-green-700",
  MEDIUM: "bg-yellow-900/70 text-yellow-300 border-yellow-700",
  LOW: "bg-red-900/70 text-red-300 border-red-700",
};

interface ConfidenceBadgeProps {
  confidence: string;
}

const ConfidenceBadge: FC<ConfidenceBadgeProps> = ({ confidence }) => {
  const style = CONFIDENCE_STYLES[confidence.toUpperCase()] ?? "bg-gray-900/70 text-gray-300 border-gray-700";
  return (
    <span className={`inline-flex rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${style}`}>
      {confidence}
    </span>
  );
};

export default ConfidenceBadge;
