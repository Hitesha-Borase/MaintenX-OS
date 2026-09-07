import React, { useState } from "react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { ShieldCheck } from "lucide-react";
import { useApp } from "../../../context/AppContext";

export function ApprovedReleases() {
  const { addToast } = useApp();

  const [releases, setReleases] = useState([
    { id: 1, batch: "BAT-2026-0888", recipe: "Organic Orange Juice 1L", approvedBy: "Maria Santos (QA Lead)", date: "2026-08-30", status: "APPROVED" },
    { id: 2, batch: "BAT-2026-0889", recipe: "Organic Orange Juice 500ml", approvedBy: "Maria Santos (QA Lead)", date: "2026-08-30", status: "APPROVED" }
  ]);

  const handleToggleStatus = (id, currentStatus) => {
    setReleases(prev => prev.map(r => {
      if (r.id === id) {
        if (currentStatus === "APPROVED") {
          addToast(`Approval revoked for ${r.batch}.`, "error");
          return { ...r, status: "REVOKED" };
        } else {
          addToast(`Batch ${r.batch} APPROVED.`, "success");
          return { ...r, status: "APPROVED" };
        }
      }
      return r;
    }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "100%" }}>
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
          Approved QA Releases
        </h1>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {releases.map((r) => (
          <Card 
            key={r.id} 
            style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              padding: "20px 24px",
              borderRadius: "16px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <ShieldCheck size={22} color="#10B981" strokeWidth={2} />
              <span style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: 500 }}>
                {r.recipe} &bull; Approved by: {r.approvedBy} &bull; {r.date}
              </span>
            </div>
            <div 
              style={{ cursor: "pointer", transition: "opacity 0.2s" }}
              onClick={() => handleToggleStatus(r.id, r.status)}
              onMouseOver={(e) => e.currentTarget.style.opacity = 0.8}
              onMouseOut={(e) => e.currentTarget.style.opacity = 1}
            >
              <Badge variant={r.status === "APPROVED" ? "emerald" : "destructive"}>{r.status}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

