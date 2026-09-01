import React from "react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { useProduction } from "../../../context/ProductionContext";
import { FileText } from "lucide-react";

export function BatchReview() {
  const { batches } = useProduction();

  // Handle case where batches are empty to display template like screenshot
  const displayBatches = batches && batches.length > 0 ? batches : [{
    id: "template",
    recipeName: "",
    currentStep: "",
    progressPercent: 77
  }];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "900px" }}>
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
          Active Batch Quality Review
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
          Reconcile in-process quality parameters before final release approval
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {displayBatches.map((batch) => (
          <Card 
            key={batch.id} 
            style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              padding: "20px 24px",
              borderRadius: "16px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <FileText size={22} color="#38BDF8" strokeWidth={2} />
              <span style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: 500 }}>
                Recipe: {batch.recipeName} | Status: {batch.currentStep}
              </span>
            </div>
            <Badge variant="cyan">{batch.progressPercent}% COMPLETE</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}
