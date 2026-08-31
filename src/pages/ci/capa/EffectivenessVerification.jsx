import React, { useState } from "react";
import { FileCheck } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { useApp } from "../../../context/AppContext";

export function EffectivenessVerification() {
  const { addToast } = useApp();

  const [verifications, setVerifications] = useState([
    { id: "CA-301", action: "Replace HTST temperature probe", verificationCriteria: "No CCP excursions in 30-day window post-replacement", status: "Pending" }
  ]);

  const handleVerify = (id) => {
    setVerifications(prev => prev.map(v => v.id === id ? { ...v, status: "Effective" } : v));
    addToast(`CAPA action ${id} verified as effective. Investigation closed.`, "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "900px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          CAPA Effectiveness Verification
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Confirm that corrective and preventive actions have achieved their intended outcomes
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {verifications.map((v) => (
          <Card key={v.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderLeft: v.status === "Effective" ? "4px solid #10B981" : "4px solid var(--border-subtle)" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FileCheck size={16} color={v.status === "Effective" ? "#10B981" : "#38BDF8"} />
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#FFFFFF" }}>{v.id}</span>
                <Badge variant={v.status === "Effective" ? "emerald" : "warning"}>{v.status}</Badge>
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>{v.action}</p>
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Criteria: {v.verificationCriteria}</span>
            </div>
            {v.status === "Pending" && (
              <Button variant="success" size="sm" icon={FileCheck} onClick={() => handleVerify(v.id)}>Verify Effective</Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
