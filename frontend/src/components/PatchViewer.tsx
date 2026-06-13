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
      <h3 className="mb-2 font-semibold text-[#f3f4f6]">Patch</h3>
      <pre className="overflow-x-auto rounded-lg bg-[#0a0f1a] p-4 font-mono text-sm text-[#f3f4f6]">
        <code>{ctx.latest_patch.proposed_code}</code>
      </pre>
    </div>
  );
};

export default PatchViewer;
