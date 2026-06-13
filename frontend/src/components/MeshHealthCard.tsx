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
  <div className="rounded-lg border border-[#1f2937] bg-[#0a0f1a] p-4">
    <div className="text-xs font-medium uppercase tracking-wider text-[#9ca3af]">
      {label}
    </div>
    <div className="mt-1 text-2xl font-bold text-[#f3f4f6]">{value}</div>
  </div>
);

const MeshHealthCard: FC<MeshHealthCardProps> = ({ ctx }) => {
  if (!ctx) {
    return (
      <div className="rounded-xl border border-[#1f2937] bg-[#111827] p-6 shadow-lg">
        <h3 className="mb-3 font-semibold text-[#f3f4f6]">Mesh Health</h3>
        <p className="text-sm text-[#9ca3af]">Run a mesh to see health data.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#1f2937] bg-[#111827] p-6 shadow-lg">
      <h3 className="mb-4 font-semibold text-[#f3f4f6]">Mesh Health</h3>
      <div className="grid grid-cols-2 gap-3">
        <Metric label="Status" value={ctx.status} />
        <Metric label="Iterations" value={ctx.mesh_iteration} />
        <Metric label="Events" value={ctx.event_history.length} />
        <Metric label="Failures" value={ctx.agent_failures.length} />
      </div>
    </div>
  );
};

export default MeshHealthCard;
