import React, { useState } from "react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { AlertOctagon } from "lucide-react";
import { useApp } from "../../../context/AppContext";

export function NonConformance() {
  const { addToast } = useApp();

  const [ncrList, setNcrList] = useState([
    { id: "NCR-402", part: "Aseptic Orange Caps (LOT-ORG-442)", reason: "Plastic thread dimensions out-of-spec (0.2mm variance)", status: "PENDING QA REVIEW" }
  ]);

  const handleToggleStatus = (id, currentStatus) => {
    setNcrList(prev => prev.map(n => {
      if (n.id === id) {
        if (currentStatus === "PENDING QA REVIEW") {
          addToast(`${n.id} marked as REVIEWED.`, "success");
          return { ...n, status: "REVIEWED" };
        } else {
          addToast(`${n.id} marked as PENDING QA REVIEW.`, "warning");
          return { ...n, status: "PENDING QA REVIEW" };
        }
      }
      return n;
    }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "100%" }}>
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
          Non-Conformance Reports (NCR)
        </h1>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {ncrList.map((n) => (
          <Card 
            key={n.id} 
            style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center", 
              borderLeft: "4px solid #EF4444",
              padding: "20px 24px",
              borderRadius: "16px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%" }}>
              <AlertOctagon size={22} color="#EF4444" strokeWidth={2} style={{ flexShrink: 0 }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                <span style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: 500 }}>
                  Reason: {n.reason}
                </span>
                <div 
                  style={{ cursor: "pointer", transition: "opacity 0.2s" }}
                  onClick={() => handleToggleStatus(n.id, n.status)}
                  onMouseOver={(e) => e.currentTarget.style.opacity = 0.8}
                  onMouseOut={(e) => e.currentTarget.style.opacity = 1}
                >
                  <Badge variant={n.status === "PENDING QA REVIEW" ? "slate" : "emerald"}>{n.status}</Badge>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

