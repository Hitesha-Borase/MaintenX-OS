import React, { useState } from "react";
import { FileCheck } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { useApp } from "../../../context/AppContext";

export function BenefitsVerification() {
  const { addToast } = useApp();

  const [verifications, setVerifications] = useState([
    { id: "CI-001", title: "OEE Improvement — Line 1 Filler", savings: "$38,200", criteria: "OEE increase ≥ 2% sustained over 30 days", status: "Pending" },
    { id: "CI-003", title: "Label Application Defect Elimination", savings: "$11,200", criteria: "Label defect rate < 0.1% for 60 days", status: "Verified" }
  ]);

  const handleVerify = (id) => {
    setVerifications(prev => prev.map(v => v.id === id ? { ...v, status: "Verified" } : v));
    addToast(`CI Project ${id} benefits formally verified and locked.`, "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "900px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>Benefits Verification</h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>Formally verify that CI project savings are sustained and financially validated</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {verifications.map((v) => (
          <Card key={v.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderLeft: v.status === "Verified" ? "4px solid #10B981" : "4px solid var(--border-subtle)" }}>
            <div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <FileCheck size={16} color={v.status === "Verified" ? "#10B981" : "#38BDF8"} />
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#FFFFFF" }}>{v.id}: {v.title}</span>
                <Badge variant={v.status === "Verified" ? "emerald" : "warning"}>{v.status}</Badge>
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>Savings: {v.savings} | Criteria: {v.criteria}</p>
            </div>
            {v.status === "Pending" && (
              <Button variant="success" size="sm" icon={FileCheck} onClick={() => handleVerify(v.id)}>Verify Benefits</Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
