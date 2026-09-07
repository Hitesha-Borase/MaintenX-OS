import React, { useState } from "react";
import { ArrowRight, CheckCircle2, ShieldAlert, Building2, PackageCheck, Truck, Factory, FileCheck } from "lucide-react";
import { Badge } from "../common/Badge";

export function TraceabilityNodeGraph({ stages = [] }) {
  const [selectedNode, setSelectedNode] = useState(null);

  const getStageIcon = (stageTitle) => {
    if (stageTitle.includes("Supplier")) return Building2;
    if (stageTitle.includes("Receiving")) return FileCheck;
    if (stageTitle.includes("Formulation") || stageTitle.includes("Aseptic")) return Factory;
    if (stageTitle.includes("Packaging") || stageTitle.includes("Palletizing")) return PackageCheck;
    return Truck;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      {/* Interactive Traceability Flow Columns */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          overflowX: "auto",
          paddingBottom: "16px",
          alignItems: "stretch"
        }}
      >
        {stages.map((stage, sIdx) => {
          const StageIcon = getStageIcon(stage.stage);

          return (
            <React.Fragment key={sIdx}>
              <div
                style={{
                  minWidth: "250px",
                  maxWidth: "280px",
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "12px",
                  display: "flex",
                  flexDirection: "column",
                  padding: "16px",
                  flexShrink: 0
                }}
              >
                {/* Stage Header */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "10px" }}>
                  <div style={{ padding: "6px", borderRadius: "6px", backgroundColor: "rgba(56, 189, 248, 0.15)", color: "#38BDF8" }}>
                    <StageIcon size={16} />
                  </div>
                  <h4 style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>{stage.stage}</h4>
                </div>

                {/* Stage Nodes */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
                  {stage.nodes.map((node) => {
                    const isSelected = selectedNode?.id === node.id;

                    return (
                      <div
                        key={node.id}
                        onClick={() => setSelectedNode(node)}
                        style={{
                          padding: "10px 12px",
                          borderRadius: "8px",
                          backgroundColor: isSelected ? "rgba(56, 189, 248, 0.15)" : "var(--bg-card-subtle)",
                          border: isSelected ? "1px solid #38BDF8" : "1px solid var(--border-subtle)",
                          cursor: "pointer",
                          transition: "all 0.15s ease"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: 700, color: "var(--accent-blue)" }}>
                            {node.id}
                          </span>
                          <span style={{ fontSize: "10px", padding: "1px 5px", borderRadius: "4px", backgroundColor: "#1E293B", color: "#94A3B8" }}>
                            {node.type}
                          </span>
                        </div>

                        <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>
                          {node.label}
                        </div>

                        {node.material && (
                          <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>
                            {node.material}
                          </div>
                        )}

                        {node.lot && (
                          <div style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: "2px" }}>
                            Lot: {node.lot}
                          </div>
                        )}
                        {node.param && (
                          <div style={{ fontSize: "10px", color: "#34D399", fontWeight: 600, marginTop: "2px" }}>
                            {node.param}
                          </div>
                        )}
                        {node.speed && (
                          <div style={{ fontSize: "10px", color: "var(--text-secondary)", marginTop: "2px" }}>
                            Speed: {node.speed} • {node.o2Level}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {sIdx < stages.length - 1 && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", flexShrink: 0 }}>
                  <ArrowRight size={18} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Selected Node Inspector Drawer / Card */}
      {selectedNode && (
        <div style={{ padding: "16px 20px", borderRadius: "10px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-highlight)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <CheckCircle2 size={18} color="#10B981" />
              <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                Selected Trace Node: {selectedNode.id} - {selectedNode.label}
              </span>
              <Badge variant="emerald">Verified 100% Chain-of-Custody</Badge>
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
              {selectedNode.material ? `Material: ${selectedNode.material} • Lot: ${selectedNode.lot}` : selectedNode.param || selectedNode.result || selectedNode.orderNo || "Inspection & Process Parameters verified against SOP master spec."}
            </p>
          </div>

          <button
            className="btn btn-secondary"
            style={{ fontSize: "12px" }}
            onClick={() => setSelectedNode(null)}
          >
            Dismiss Details
          </button>
        </div>
      )}
    </div>
  );
}
