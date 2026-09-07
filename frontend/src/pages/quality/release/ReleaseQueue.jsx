import React from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { Clock, FileCheck } from "lucide-react";
import { useQualityStore } from "../utils/useQualityStore";

export function ReleaseQueue() {
  const navigate = useNavigate();
  const qualityState = useQualityStore();

  const pendingBatches = qualityState.releases.filter(r => r.status === "Pending Review");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "100%" }}>
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
          QA Human Release Queue
        </h1>
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
                borderRadius: "16px",
                flexWrap: "wrap",
                gap: "16px",
                borderLeft: "4px solid #F59E0B"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "16px", width: "100%", flex: 1, minWidth: "250px" }}>
                <div style={{ padding: "10px", backgroundColor: "rgba(245, 158, 11, 0.1)", borderRadius: "10px", flexShrink: 0 }}>
                  <Clock size={24} color="#F59E0B" strokeWidth={2} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>{b.batch}</span>
                    <Badge variant="warning">AWAITING QA SIGN-OFF</Badge>
                  </div>
                  <span style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: 500 }}>
                    Release Request ID: {b.id}
                  </span>
                </div>
              </div>
              
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Button variant="primary" size="md" icon={FileCheck} onClick={() => navigate("/quality/release/review", { state: { releaseId: b.id, batch: b.batch } })}>
                  Review & Sign-Off
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

