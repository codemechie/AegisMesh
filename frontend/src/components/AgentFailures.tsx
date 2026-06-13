import type { FC } from "react";
import type { MeshContext } from "../types/mesh";

interface AgentFailuresProps {
  ctx?: MeshContext;
}

const AgentFailures: FC<AgentFailuresProps> = ({ ctx }) => {
  const failures = ctx?.agent_failures ?? [];

  if (failures.length === 0) {
    return (
      <div className="rounded-xl border border-green-900/50 bg-[#0a3b0a] p-6 shadow-lg">
        <h3 className="mb-1 font-semibold text-green-400">Agent Failures</h3>
        <p className="text-sm text-green-500">
          No agent failures recorded.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-red-900/50 bg-[#3b0a0a] p-6 shadow-lg">
      <h3 className="mb-3 font-semibold text-red-400">Agent Failures</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-red-400">
              <th className="pb-2 pr-4">Agent</th>
              <th className="pb-2 pr-4">Event Type</th>
              <th className="pb-2">Error</th>
            </tr>
          </thead>
          <tbody>
            {failures.map((f, i) => (
              <tr key={i} className="border-t border-red-900/30">
                <td className="py-2 pr-4 font-medium text-[#f3f4f6]">
                  {f.agent}
                </td>
                <td className="py-2 pr-4 text-[#f3f4f6]">{f.event_type}</td>
                <td className="py-2">
                  <pre className="whitespace-pre-wrap font-mono text-xs text-red-300">
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
