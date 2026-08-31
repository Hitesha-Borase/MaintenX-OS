import React, { useState } from "react";
import { ShieldAlert, Zap, AlertTriangle } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { useApp } from "../../../context/AppContext";

export function ServiceRisk() {
  const { addToast } = useApp();

  const [risks, setRisks] = useState([
    { id: "RSK-01", title: "Kroger OTIF Service Penalty (PO-1090)", reason: "Orange cap safety stock shortage on Line 1", severity: "High Risk", status: "Active" }
  ]);

  const handleMitigate = (id, title) => {
    setRisks(prev =>
      prev.map(r => r.id === id ? { ...r, status: "Mitigated" } : r)
    );
    addToast(`Risk "${title}" mitigated. Alternate supplier contract authorized.`, "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Fulfillment Service Risks
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Monitor and mitigate potential On-Time-In-Full (OTIF) delivery penalties
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {risks.map((r) => (
          <Card key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderLeft: r.status === "Active" ? "4px solid #EF4444" : "4px solid #10B981" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ShieldAlert size={16} color={r.status === "Active" ? "#EF4444" : "#10B981"} />
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>{r.id}: {r.title}</span>
                <Badge variant={r.status === "Active" ? "danger" : "emerald"}>{r.status}</Badge>
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                Reason: {r.reason} | Severity: <strong style={{ color: "#EF4444" }}>{r.severity}</strong>
              </div>
            </div>

            {r.status === "Active" && (
              <Button variant="primary" size="sm" icon={Zap} onClick={() => handleMitigate(r.id, r.title)}>
                Mitigate Risk
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
