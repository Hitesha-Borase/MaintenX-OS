import React from "react";
import { useProduction } from "../../context/ProductionContext";
import { useApp } from "../../context/AppContext";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { Layers, AlertOctagon, Check } from "lucide-react";

export function Batches() {
  const { batches, setProductionOrders } = useProduction();
  const { addToast } = useApp();

  const handleHoldBatch = (batchId) => {
    addToast(`Batch ${batchId} placed on Quality quarantine hold.`, "danger");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Active Batches (Formulation)
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Monitor recipe blending, agitating, and sanitisation checks for active product runs
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {batches.map((batch) => (
          <Card key={batch.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Layers size={16} color="#A855F7" />
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>{batch.id}</span>
                <Badge variant={batch.progressPercent >= 100 ? "emerald" : "cyan"}>
                  {batch.progressPercent >= 100 ? "Completed" : `${batch.progressPercent}%`}
                </Badge>
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Recipe: {batch.recipeName} (v{batch.recipeVersion}) • Current Step: {batch.currentStep}
              </div>
            </div>

            <div style={{ display: "flex", gap: "6px" }}>
              <Button variant="danger" size="sm" icon={AlertOctagon} onClick={() => handleHoldBatch(batch.id)}>
                Hold
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
