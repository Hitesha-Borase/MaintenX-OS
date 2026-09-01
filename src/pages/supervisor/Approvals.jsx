import React, { useState } from "react";
import { FileCheck, Check, X, ShieldCheck } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { useApp } from "../../context/AppContext";

export function Approvals() {
  const { addToast } = useApp();

  const [requests, setRequests] = useState([
    { id: "APP-901", type: "Sanitation Release", details: "Line 1 cleaning checklist signed off by operator. Requires supervisor sign-off.", status: "Pending" },
    { id: "APP-902", type: "Material Hold Release", details: "Rework request for batch BAT-2026-0890. Brix concentration deviation corrected.", status: "Pending" },
    { id: "APP-903", type: "PM Audit Verification", details: "Hourly calibration check audit signature required for Pasteurizer HTST-300.", status: "Pending" }
  ]);

  const handleApprove = (id, type) => {
    setRequests(prev =>
      prev.map(r => r.id === id ? { ...r, status: "Approved" } : r)
    );
    addToast(`Approval Request ${id} (${type}) has been Authorized.`, "success");
  };

  const handleReject = (id, type) => {
    setRequests(prev =>
      prev.map(r => r.id === id ? { ...r, status: "Rejected" } : r)
    );
    addToast(`Approval Request ${id} (${type}) has been Rejected.`, "danger");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Pending Shift Approvals
        </h1>

      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {requests.map((r) => (
          <Card key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FileCheck size={16} color="#F59E0B" />
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>{r.id}: {r.type}</span>
                <Badge variant={r.status === "Approved" ? "emerald" : r.status === "Rejected" ? "danger" : "warning"}>
                  {r.status}
                </Badge>
              </div>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
                {r.details}
              </p>
            </div>

            {r.status === "Pending" && (
              <div style={{ display: "flex", gap: "6px" }}>
                <Button variant="success" size="sm" icon={Check} onClick={() => handleApprove(r.id, r.type)}>
                  Approve
                </Button>
                <Button variant="danger" size="sm" icon={X} onClick={() => handleReject(r.id, r.type)}>
                  Reject
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
