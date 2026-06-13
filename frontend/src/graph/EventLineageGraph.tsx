import { useMemo } from "react";
import {
  ReactFlow,
  type Node,
  type Edge,
  Background,
  Controls,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { MeshContext } from "../types/mesh";

interface EventLineageGraphProps {
  ctx?: MeshContext;
}

const NODE_BG: Record<string, string> = {
  VULNERABILITY_TRIAGED: "#3b0a0a",
  PATCH_PROPOSED: "#0a1a3b",
  AUDIT_COMPLETED: "#0a3b0a",
};

const BORDER_COLORS: Record<string, string> = {
  VULNERABILITY_TRIAGED: "#dc2626",
  PATCH_PROPOSED: "#2563eb",
  AUDIT_COMPLETED: "#16a34a",
};

function EventLineageGraph({ ctx }: EventLineageGraphProps) {
  const { nodes, edges } = useMemo(() => {
    const eventNodes: Node[] = [];
    const eventEdges: Edge[] = [];

    if (!ctx || ctx.event_history.length === 0) {
      return { nodes: eventNodes, edges: eventEdges };
    }

    for (const [i, ev] of ctx.event_history.entries()) {
      eventNodes.push({
        id: ev.event_id,
        position: { x: 100, y: i * 120 },
        data: { label: ev.event_type },
        style: {
          background: NODE_BG[ev.event_type] ?? "#1f2937",
          border: `2px solid ${BORDER_COLORS[ev.event_type] ?? "#4b5563"}`,
          borderRadius: 8,
          padding: "8px 16px",
          fontWeight: 600,
          fontSize: 13,
          color: "#f3f4f6",
        },
      });

      if (ev.parent_event_id) {
        eventEdges.push({
          id: `${ev.parent_event_id}->${ev.event_id}`,
          source: ev.parent_event_id,
          target: ev.event_id,
          type: "smoothstep",
          animated: false,
          style: { stroke: "#4b5563", strokeWidth: 2 },
        });
      }
    }

    return { nodes: eventNodes, edges: eventEdges };
  }, [ctx]);

  if (!ctx || ctx.event_history.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center rounded-xl border border-[#1f2937] bg-[#111827] text-sm text-[#9ca3af]">
        No event lineage available.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#1f2937] bg-[#111827] p-6 shadow-lg">
      <h3 className="mb-4 font-semibold text-[#f3f4f6]">
        Causal Execution Graph
      </h3>
      <div className="h-96 overflow-hidden rounded-lg border border-[#1f2937] bg-[#0a0f1a]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag={false}
          zoomOnScroll={false}
        >
          <Background color="#1f2937" gap={20} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </div>
  );
}

export default EventLineageGraph;
