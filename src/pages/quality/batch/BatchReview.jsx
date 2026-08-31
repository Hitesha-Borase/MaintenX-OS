import React from "react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { useProduction } from "../../../context/ProductionContext";
import { FileText } from "lucide-react";

export function BatchReview() {
  const { batches } = useProduction();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Active Batch Quality Review
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Reconcile in-process quality parameters before final release approval
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {batches.map((batch) => (
          <Card key={batch.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <FileText size={18} color="#38BDF8" />
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>Batch {batch.id}</h4>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  Recipe: {batch.recipeName} | Status: <strong style={{ color: "#FFFFFF" }}>{batch.currentStep}</strong>
                </span>
              </div>
            </div>
            <Badge variant="cyan">{batch.progressPercent}% Complete</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}
