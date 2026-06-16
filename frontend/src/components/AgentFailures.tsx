import type { FC } from "react";
import type { MeshContext } from "../types/mesh";

interface AgentFailuresProps {
  ctx?: MeshContext;
}

const AgentFailures: FC<AgentFailuresProps> = ({ ctx }) => {
  const failures = ctx?.agent_failures ?? [];

  if (failures.length === 0) {
    return (
      <div className="rounded-lg border border-green-900/50 bg-[#0a3b0a] p-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-green-400">
          Agent Failures
        </span>
        <p className="mt-0.5 text-xs text-green-500">No agent failures recorded.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-red-900/50 bg-[#3b0a0a] p-3">
      <span className="text-xs font-semibold uppercase tracking-wider text-red-400">
        Agent Failures
      </span>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-red-400">
              <th className="pb-1 pr-3">Agent</th>
              <th className="pb-1 pr-3">Event</th>
              <th className="pb-1">Error</th>
            </tr>
          </thead>
          <tbody>
            {failures.map((f, i) => (
              <tr key={i} className="border-t border-red-900/30">
                <td className="py-1 pr-3 font-medium text-[#f3f4f6]">{f.agent}</td>
                <td className="py-1 pr-3 text-[#f3f4f6]">{f.event_type}</td>
                <td className="py-1">
                  <pre className="whitespace-pre-wrap font-mono text-[10px] text-red-300">
                    {f.error}
                  </pre>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AgentFailures;
