import type { FC } from "react";
import type { MeshContext } from "../types/mesh";

interface MeshHealthCardProps {
  ctx: MeshContext | null;
}

const Metric = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <div className="rounded border border-[#1f2937] bg-[#0a0f1a] p-2">
    <div className="text-[10px] font-medium uppercase tracking-wider text-[#9ca3af]">
      {label}
    </div>
    <div className="mt-0.5 text-sm font-bold text-[#f3f4f6]">{value}</div>
  </div>
);

const MeshHealthCard: FC<MeshHealthCardProps> = ({ ctx }) => {
  if (!ctx) {
    return (
      <div className="rounded-lg border border-[#1f2937] bg-[#111827] p-3">
        <span className="text-xs font-semibold text-[#9ca3af]">Mesh Health</span>
        <p className="mt-1 text-xs text-[#6b7280]">Run a mesh to see health data.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[#1f2937] bg-[#111827] p-3">
      <span className="text-xs font-semibold uppercase tracking-wider text-[#9ca3af]">
        Mesh Health
      </span>
      <div className="mt-2 grid grid-cols-4 gap-2">
        <Metric label="Status" value={ctx.status} />
        <Metric label="Iterations" value={ctx.mesh_iteration} />
        <Metric label="Events" value={ctx.event_history.length} />
        <Metric label="Failures" value={ctx.agent_failures.length} />
      </div>
    </div>
  );
};

export default MeshHealthCard;
