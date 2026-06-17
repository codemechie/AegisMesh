import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import type { FC } from "react";
import { runMesh } from "../api/aegismesh";
import type { MeshContext } from "../types/mesh";
import { useMeshData } from "../context/MeshDataContext";
import RunForm from "../components/RunForm";
import SecurityIntelligenceHero from "../components/SecurityIntelligenceHero";
import PatchViewer from "../components/PatchViewer";
import EventTimeline from "../components/EventTimeline";
import ExploitChain from "../components/ExploitChain";
import SecurityConvergence from "../components/SecurityConvergence";
import MeshHealthCard from "../components/MeshHealthCard";
import AgentFailures from "../components/AgentFailures";
import AgentMeshFlow from "../graph/AgentMeshFlow";

const STATUS_BADGE: Record<string, string> = {
  SECURED: "bg-green-900/60 text-green-400 border-green-700",
  AUDITING: "bg-blue-900/60 text-blue-400 border-blue-700",
  UNDER_REVIEW: "bg-yellow-900/60 text-yellow-400 border-yellow-700",
  ESCALATION_REQUIRED: "bg-red-900/60 text-red-400 border-red-700",
};

const Dashboard: FC = () => {
  const { data, mutate, isPending, error } = useMutation<
    MeshContext,
    Error,
    { sourceCode: string; vulnerability: string }
  >({
    mutationFn: ({ sourceCode, vulnerability }) =>
      runMesh({ source_code: sourceCode, vulnerability }),
  });

  const { setData } = useMeshData();

  useEffect(() => {
    if (data) {
      setData(data);
    }
  }, [data, setData]);

  const handleRun = (sourceCode: string, vulnerability: string) => {
    mutate({ sourceCode, vulnerability });
  };

  const statusClass = data
    ? STATUS_BADGE[data.status] ?? "bg-gray-900/60 text-gray-400 border-gray-700"
    : "bg-gray-900/60 text-gray-500 border-gray-700";

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <header className="flex items-center justify-between rounded-xl border border-[#1f2937] bg-[#111827] p-6 shadow-lg">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#f3f4f6]">
            AegisMesh
          </h1>
          <p className="mt-1 text-sm text-[#9ca3af]">
            Adversarial Autonomous Security Remediation Mesh
          </p>
        </div>
        <span
          className={`rounded-lg border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider ${statusClass}`}
        >
          {data ? data.status : "Idle"}
        </span>
      </header>

      <RunForm onRun={handleRun} loading={isPending} />

      {error && (
        <div className="rounded-xl border border-red-900/50 bg-[#3b0a0a] p-4 text-sm text-red-400 shadow-lg">
          {error.message}
        </div>
      )}

      <SecurityIntelligenceHero ctx={data} />

      <PatchViewer ctx={data ?? null} />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <EventTimeline ctx={data} />
        <ExploitChain ctx={data} />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <SecurityConvergence ctx={data} />
        <MeshHealthCard ctx={data ?? null} />
      </div>

      <AgentFailures ctx={data} />

      <section>
        <AgentMeshFlow ctx={data} />
      </section>
    </div>
  );
};

export default Dashboard;
