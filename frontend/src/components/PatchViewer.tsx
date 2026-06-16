import type { FC } from "react";
import type { MeshContext } from "../types/mesh";

interface PatchViewerProps {
  ctx: MeshContext | null;
}

const PatchViewer: FC<PatchViewerProps> = ({ ctx }) => {
  if (!ctx) {
    return (
      <div className="rounded-xl border border-[#1f2937] bg-[#111827] p-6 shadow-lg">
        <h3 className="mb-2 font-semibold text-[#f3f4f6]">Patch</h3>
        <p className="text-sm text-[#9ca3af]">Run a mesh to see the patch.</p>
      </div>
    );
  }

  if (!ctx.latest_patch) {
    return (
      <div className="rounded-xl border border-[#1f2937] bg-[#111827] p-6 shadow-lg">
        <h3 className="mb-2 font-semibold text-[#f3f4f6]">Patch</h3>
        <p className="text-sm text-[#9ca3af]">No patch produced.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#1f2937] bg-[#111827] p-6 shadow-lg">
      <div className="mb-3 flex items-center gap-2">
        <h3 className="font-semibold text-[#f3f4f6]">Patch</h3>
        <span className="inline-flex items-center gap-1 rounded border border-blue-900/50 bg-blue-900/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-400">
          <span>BLUE</span>
          <span className="font-normal normal-case text-[#9ca3af]">
            {ctx.benchmark_telemetry.blue_model.split("/").pop() ?? ""}
          </span>
        </span>
      </div>
      <pre className="overflow-x-auto rounded-lg bg-[#0a0f1a] p-4 font-mono text-sm text-[#f3f4f6]">
        <code>{ctx.latest_patch.proposed_code}</code>
      </pre>
    </div>
  );
};

export default PatchViewer;
