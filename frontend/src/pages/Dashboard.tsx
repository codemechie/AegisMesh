import { useMutation } from "@tanstack/react-query";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { FC } from "react";
import { runMesh } from "../api/aegismesh";
import type { MeshContext, AuditCritique } from "../types/mesh";
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
import FindingDetailsModal from "../components/FindingDetailsModal";

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

  const { data: contextData, setData } = useMeshData();

  const [displayData, setDisplayData] = useState<MeshContext | undefined>(contextData ?? undefined);

  useEffect(() => {
    if (contextData) {
      setDisplayData(contextData);
    }
  }, []);

  useEffect(() => {
    if (data) {
      setDisplayData(data);
      setData(data);
    }
  }, [data, setData]);

  const [modalFindings, setModalFindings] = useState<AuditCritique[]>([]);
  const [modalFilterType, setModalFilterType] = useState<string | null>(null);

  const handleRun = (sourceCode: string, vulnerability: string) => {
    mutate({ sourceCode, vulnerability });
  };

  const handleViewFindings = useCallback(
    (type: string) => {
      if (!displayData) return;
      const filtered = displayData.audit_history.filter((a) => a.finding_type === type);
      setModalFindings(filtered);
      setModalFilterType(type);
    },
    [displayData],
  );

  const navigate = useNavigate();

  const handleCloseModal = useCallback(() => {
    setModalFindings([]);
    setModalFilterType(null);
  }, []);

  const statusClass = displayData
    ? STATUS_BADGE[displayData.status] ?? "bg-gray-900/60 text-gray-400 border-gray-700"
    : "bg-gray-900/60 text-gray-500 border-gray-700";

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <header className="flex items-center justify-between rounded-xl border border-[#1f2937] bg-[#111827] p-6 shadow-lg">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#1f2937] bg-[#111827] px-3 py-1.5 text-xs font-semibold text-[#9ca3af] transition-colors hover:bg-[#1f2937] hover:text-[#f3f4f6]"
          >
            &larr; Home
          </button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#f3f4f6]">
              AegisMesh
            </h1>
            <p className="mt-1 text-sm text-[#9ca3af]">
              Adversarial Autonomous Security Remediation Mesh
            </p>
          </div>
        </div>
        <span
          className={`rounded-lg border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider ${statusClass}`}
        >
          {displayData ? displayData.status : "Idle"}
        </span>
      </header>

      <RunForm onRun={handleRun} loading={isPending} />

      {error && (
        <div className="rounded-xl border border-red-900/50 bg-[#3b0a0a] p-4 text-sm text-red-400 shadow-lg">
          {error.message}
        </div>
      )}

      <SecurityIntelligenceHero ctx={displayData} />

      <PatchViewer ctx={displayData ?? null} />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <EventTimeline ctx={displayData} />
        <ExploitChain ctx={displayData} onViewFindings={handleViewFindings} />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <SecurityConvergence ctx={displayData} onViewFindings={handleViewFindings} />
        <MeshHealthCard ctx={displayData ?? null} />
      </div>

      <AgentFailures ctx={displayData} />

      <section>
        <AgentMeshFlow ctx={displayData} />
      </section>

      {(modalFindings.length > 0 || modalFilterType !== null) && (
        <FindingDetailsModal
          key={`${modalFilterType ?? "all"}-${modalFindings.length}`}
          findings={modalFindings}
          filteredType={modalFilterType as "VERIFIED_EXPLOIT" | "SPECULATIVE_RISK" | "INFORMATIONAL" | null}
          onClose={handleCloseModal}
          securityReport={displayData?.security_report ?? null}
          eventHistory={displayData?.event_history}
          totalIterations={displayData?.audit_history.length}
        />
      )}
    </div>
  );
};

export default Dashboard;
