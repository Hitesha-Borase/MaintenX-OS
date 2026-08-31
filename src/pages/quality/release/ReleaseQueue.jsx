import React from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { Clock, FileCheck } from "lucide-react";
import { useProduction } from "../../../context/ProductionContext";

export function ReleaseQueue() {
  const navigate = useNavigate();
  const { batches } = useProduction();

  const pendingBatches = batches.filter(b => b.progressPercent >= 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          QA Human Release Queue
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Batches awaiting manual QA sign-off before finished goods are available for shipping.
          <strong style={{ color: "#EF4444", display: "block", marginTop: "4px" }}>
            ⚠ AI cannot auto-release batches. All releases require human QA approval.
          </strong>
        </p>
      </div>

      {pendingBatches.length === 0 ? (
        <Card style={{ padding: "40px", textAlign: "center" }}>
          <Clock size={32} color="var(--text-muted)" style={{ margin: "0 auto 12px" }} />
          <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>No batches currently awaiting release.</p>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {pendingBatches.map((b) => (
            <Card key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Clock size={16} color="#F59E0B" />
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>Batch {b.id}</span>
                  <Badge variant="warning">Awaiting QA Sign-Off</Badge>
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                  Recipe: {b.recipeName}
                </div>
              </div>
              <Button variant="primary" size="sm" icon={FileCheck} onClick={() => navigate("/quality/release/review")}>
                Review & Sign-Off
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
