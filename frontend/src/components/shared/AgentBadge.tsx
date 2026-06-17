import type { FC, ReactNode } from "react";

interface AgentBadgeProps {
  label: string;
  color: "blue" | "red" | "purple";
  children?: ReactNode;
}

const AGENT_CLASSES: Record<string, { border: string; bg: string; text: string; dot: string }> = {
  blue: { border: "border-blue-900/40", bg: "bg-blue-900/20", text: "text-blue-400", dot: "bg-blue-400" },
  red: { border: "border-red-900/40", bg: "bg-red-900/20", text: "text-red-400", dot: "bg-red-400" },
  purple: { border: "border-purple-900/40", bg: "bg-purple-900/20", text: "text-purple-400", dot: "bg-purple-400" },
};

const AgentBadge: FC<AgentBadgeProps> = ({ label, color, children }) => {
  const c = AGENT_CLASSES[color];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${c.border} ${c.bg} px-3 py-1 text-xs font-semibold ${c.text}`}>
      {children ?? <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />}
      {label}
    </span>
  );
};

export default AgentBadge;
