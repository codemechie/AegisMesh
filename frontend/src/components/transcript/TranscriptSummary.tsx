import type { FC } from "react";
import type { MeshContext } from "../../types/mesh";
import MetricCard from "../shared/MetricCard";
import AgentBadge from "../shared/AgentBadge";

interface TranscriptSummaryProps {
  data: MeshContext;
  messageCount: number;
}

const TranscriptSummary: FC<TranscriptSummaryProps> = ({ data, messageCount }) => {
  const telemetry = data.benchmark_telemetry;
  const report = data.security_report;
  const status = telemetry?.final_status ?? data.status;

  return (
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
          <MetricCard label="Messages Exchanged" value={messageCount} />
          <MetricCard
            label="Security Outcome"
            value={status === "SECURED" ? "Secured" : status}
            valueClassName={status === "SECURED" ? "text-green-400" : "text-orange-400"}
          />
          <MetricCard label="Total Iterations" value={data.mesh_iteration} />
          <MetricCard label="Security Score" value={report?.security_score ?? "\u2014"} />
        </div>
      </div>

      <div className="border-t border-[#1f2937] px-6 pb-4">
        <div className="text-[9px] font-semibold uppercase tracking-wider text-[#6b7280]">
          Agent Participants
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <AgentBadge label="Blue Coder Agent" color="blue" />
          <AgentBadge label="Red Auditor Agent" color="red" />
          <AgentBadge label="Security Intelligence Agent" color="purple" />
        </div>
      </div>
    </div>
  );
};

export default TranscriptSummary;
