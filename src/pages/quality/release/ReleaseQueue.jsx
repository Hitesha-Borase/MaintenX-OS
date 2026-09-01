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

  const pendingBatches = batches && batches.length > 0 ? batches.filter(b => b.progressPercent >= 100) : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "100%" }}>
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
          QA Human Release Queue
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
          Batches awaiting manual QA sign-off before finished goods are available for shipping.
          <strong style={{ color: "#EF4444", display: "block", marginTop: "4px" }}>
            ⚠ AI cannot auto-release batches. All releases require human QA approval.
          </strong>
        </p>
      </div>

      {pendingBatches.length === 0 ? (
        <Card style={{ padding: "40px", textAlign: "center", borderRadius: "16px" }}>
          <Clock size={36} color="var(--text-muted)" strokeWidth={2} style={{ margin: "0 auto 16px" }} />
          <p style={{ fontSize: "15px", color: "var(--text-secondary)" }}>No batches currently awaiting release.</p>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {pendingBatches.map((b) => (
            <Card 
              key={b.id} 
              style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                padding: "20px 24px",
                borderRadius: "16px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%" }}>
                <Clock size={22} color="#F59E0B" strokeWidth={2} style={{ flexShrink: 0 }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <Badge variant="warning" style={{ alignSelf: "flex-start", marginBottom: "4px" }}>AWAITING QA SIGN-OFF</Badge>
                    <span style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: 500 }}>
                      Recipe: {b.recipeName}
                    </span>
                  </div>
                  
                  <Button variant="primary" size="md" icon={FileCheck} onClick={() => navigate("/quality/release/review")}>
                    Review & Sign-Off
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
